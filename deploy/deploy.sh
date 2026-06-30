#!/bin/bash
# ================================================
# readme-craft 自动化部署脚本
# 用法: bash deploy/deploy.sh [deploy.conf路径]
# ================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_FILE="${1:-$SCRIPT_DIR/deploy.conf}"

if [[ ! -f "$CONF_FILE" ]]; then
  echo "错误: 配置文件不存在: $CONF_FILE"
  echo "用法: bash deploy/deploy.sh [deploy.conf路径]"
  exit 1
fi

echo "==> 读取配置: $CONF_FILE"
set -a
source "$CONF_FILE"
set +a

# 默认值
PROJECT_NAME="${PROJECT_NAME:-$(basename "$DEPLOY_PATH")}"
PM2_NAME="${PM2_NAME:-$PROJECT_NAME}"
NGINX_SITE_PATH="${NGINX_SITE_PATH:-/etc/nginx/sites-enabled/$PROJECT_NAME}"
SSL_CERT="${SSL_CERT:-/etc/nginx/ssl/openginko.tech_bundle.crt}"
SSL_CERT_KEY="${SSL_CERT_KEY:-/etc/nginx/ssl/openginko.tech.key}"

# ================================================
# 阶段 1: 环境检查
# ================================================
echo ""
echo "==> [1/6] 环境检查"

if ! command -v pm2 &> /dev/null; then
  echo "错误: pm2 未安装"
  exit 1
fi

# ================================================
# 阶段 2: Git 拉取
# ================================================
echo ""
echo "==> [2/6] Git 拉取 ($GIT_REPO)"

mkdir -p "$DEPLOY_PATH"
cd "$DEPLOY_PATH"

# 初始化仓库（如果不存在）
if [[ ! -d ".git" ]]; then
  echo "    新建仓库: git clone"
  git clone --depth 1 --branch "$GIT_BRANCH" "$GIT_REPO" .
else
  echo "    更新仓库: git pull"
  git pull origin "$GIT_BRANCH"
fi

# ================================================
# 阶段 3: 备份 & 构建
# ================================================
echo ""
echo "==> [3/6] 前端构建"

# 备份当前构建产物
if [[ -d "$FRONTEND_DIST_PATH" ]]; then
  BACKUP_DIR="$DEPLOY_PATH/backups/$(date +%Y%m%d_%H%M%S)"
  echo "    备份当前构建: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"
  cp -r "$FRONTEND_DIST_PATH" "$BACKUP_DIR/"
fi

# 前端构建
echo "    执行: $BUILD_CMD"
npm install --silent
npm run build

# ================================================
# 阶段 4: 后端构建（如果需要）
# ================================================
if [[ "$HAS_BACKEND" == "true" ]]; then
  echo ""
  echo "==> [4/6] 后端构建"

  if [[ -n "$BACKEND_BUILD_CMD" ]]; then
    echo "    执行: $BACKEND_BUILD_CMD"
    (cd server && npm install --silent && eval "$BACKEND_BUILD_CMD")
  fi
fi

# ================================================
# 阶段 5: PM2 重启
# ================================================
echo ""
echo "==> [5/6] PM2 重启 ($PM2_NAME)"

if pm2 describe "$PM2_NAME" &> /dev/null; then
  echo "    重启进程: pm2 restart $PM2_NAME"
  pm2 restart "$PM2_NAME"
else
  echo "    进程不存在，跳过 PM2（需手动启动后端）"
fi

# ================================================
# 阶段 6: Nginx 配置
# ================================================
echo ""
echo "==> [6/6] Nginx 配置"

if [[ "$UPDATE_NGINX" == "true" ]]; then
  echo "    生成 nginx 配置: $NGINX_SITE_PATH"

  # 从模板文件读取（与 deploy.sh 同目录）
  NGINX_TEMPLATE="$SCRIPT_DIR/nginx.conf"
  if [[ ! -f "$NGINX_TEMPLATE" ]]; then
    echo "    错误: nginx 模板不存在: $NGINX_TEMPLATE"
    exit 1
  fi

  # 替换变量后写入 sites-enabled
  sed -e "s|{{DOMAINS}}|${DOMAINS}|g" \
      -e "s|{{SSL_CERT}}|${SSL_CERT}|g" \
      -e "s|{{SSL_CERT_KEY}}|${SSL_CERT_KEY}|g" \
      -e "s|{{DEPLOY_PATH}}|${DEPLOY_PATH}|g" \
      -e "s|{{BACKEND_PORT}}|${BACKEND_PORT:-3001}|g" \
      "$NGINX_TEMPLATE" | sudo tee "$NGINX_SITE_PATH" > /dev/null

  echo "    测试 & 重载 nginx"
  sudo nginx -t && sudo nginx -s reload
fi

echo ""
echo "==> 部署完成!"
echo "    项目: $PROJECT_NAME"
echo "    路径: $DEPLOY_PATH"
