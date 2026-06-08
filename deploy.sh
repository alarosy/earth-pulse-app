#!/bin/bash
# ============================================
# سكريبت النشر التلقائي - منظمة نبض الأرض
# استخدم هذا السكريبت في cPanel Terminal
# ============================================

APP_ROOT="seedling-app"
GIT_REPO="https://github.com/alarosy/earth-pulse-app.git"
NODE_VERSION="20"

# ألوان المخرجات
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    بدء نشر مبادرة الشتلة الرقمية${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. تفعيل بيئة Node.js
echo -e "${YELLOW}1. تفعيل بيئة Node.js...${NC}"
source ~/nodevenv/$APP_ROOT/$NODE_VERSION/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}خطأ: لم يتم العثور على بيئة Node.js.${NC}"
    echo -e "${RED}تأكد من إنشاء تطبيق Node.js في cPanel أولاً.${NC}"
    echo -e "${RED}Application root: $APP_ROOT${NC}"
    echo -e "${RED}Node.js version: $NODE_VERSION${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ تم التفعيل${NC}"

# 2. الذهاب إلى مجلد التطبيق
echo -e "${YELLOW}2. الذهاب إلى مجلد التطبيق...${NC}"
cd ~/$APP_ROOT

# 3. جلب الكود من GitHub
echo -e "${YELLOW}3. جلب الكود من GitHub...${NC}"
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        git pull origin main
        echo -e "${GREEN}   ✓ تم تحديث الكود${NC}"
    else
        rm -rf ~/$APP_ROOT/*
        git clone $GIT_REPO .
        echo -e "${GREEN}   ✓ تم استنساخ المستودع${NC}"
    fi
else
    echo -e "${RED}   ⚠ Git غير متوفر، يرجى رفع الملفات يدوياً عبر FTP${NC}"
fi

# 4. تثبيت الاعتماديات
echo -e "${YELLOW}4. تثبيت الاعتماديات...${NC}"
npm install --production=false 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}   ✗ فشل في تثبيت الاعتماديات${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ تم تثبيت الاعتماديات${NC}"

# 5. بناء المشروع
echo -e "${YELLOW}5. بناء المشروع...${NC}"
npm run build 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}   ✗ فشل في بناء المشروع${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ تم بناء المشروع${NC}"

# 6. توليد Prisma Client
echo -e "${YELLOW}6. توليد Prisma Client...${NC}"
npx prisma generate 2>&1
echo -e "${GREEN}   ✓ تم توليد Prisma Client${NC}"

# 7. تشغيل Seed (إضافة المشرف والمدرسة)
echo -e "${YELLOW}7. تشغيل Seed (إضافة المشرف والمدرسة)...${NC}"
node scripts/seed-admin.js 2>&1
echo -e "${GREEN}   ✓ تم تشغيل Seed${NC}"

# 8. إضافة متغيرات البيئة (توجيه)
echo -e "${YELLOW}8. إضافة متغيرات البيئة...${NC}"
echo -e "${GREEN}   ✓ تم${NC}"
echo -e "${YELLOW}   ⚠ تذكر إضافة المتغيرات التالية يدوياً من واجهة cPanel:${NC}"
echo -e "${YELLOW}     - NEXTAUTH_SECRET: مفتاح سري${NC}"
echo -e "${YELLOW}     - NEXTAUTH_URL: https://yourdomain.com${NC}"
echo -e "${YELLOW}     - CLOUDINARY_API_SECRET: القيمة الصحيحة${NC}"
echo -e "${YELLOW}     - NODE_ENV: production${NC}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓✓✓ تم النشر بنجاح!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}"
echo -e "${GREEN}الآن اذهب إلى Setup Node.js App في cPanel"
echo -e "${GREEN}واضغط Restart (أو Start Application)"
echo -e "${GREEN}ثم زُر موقعك على المتصفح${NC}"
echo -e ""
echo -e "${YELLOW}بيانات الدخول الافتراضية:${NC}"
echo -e "${YELLOW}  - Admin: admin@green.com / admin123${NC}"
echo -e "${GREEN}========================================${NC}"
