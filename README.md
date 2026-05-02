# 📋 Lịch Biểu Chấm Điểm Trung Đội

Hệ thống theo dõi & đánh giá thời gian thực cho các Trung đội 9, 10, 11, 12.

## 🚀 Cài đặt & Chạy

```bash
# 1. Cài dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Mở trình duyệt
# http://localhost:3000
```

## 📦 Build production

```bash
npm run build
npm start
```

## ✨ Tính năng

- 📅 **Lịch tháng** — chuyển tháng/năm linh hoạt
- 🔴🟢🔵🟡 **4 Trung đội** (TD 9, 10, 11, 12) — mỗi trung đội có 4 ô điểm:
  - 🧹 Vệ sinh
  - 🛏️ Nội vụ
  - ⚖️ Kỉ luật
  - 🏃 Hoạt động
- 📊 **Tự động tính điểm**:
  - Điểm TB từng trung đội = TB 4 loại điểm
  - Tổng điểm cuối = TB 4 trung đội × hệ số
    - Ngày thường: × **0.4**
    - Thứ 5 (ngày tổng tuần): × **0.6**
- 📝 **Nhận xét, Ưu điểm, Khuyết điểm** — nhập văn bản tự do
- ✏️ **Chỉnh sửa** và 🗑️ **Xóa** dữ liệu đã nhập
- 💾 **Lưu cục bộ** (localStorage) — không cần backend
- 🌈 **UI gradient** sinh động, responsive

## 🗂️ Cấu trúc project

```
military-calendar/
├── app/
│   ├── globals.css       # CSS global + animations
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Entry page
├── components/
│   ├── CalendarHeader.tsx  # Nav tháng/năm
│   ├── CalendarPage.tsx    # Logic chính + grid lịch
│   ├── DayCell.tsx         # Ô ngày trên lịch
│   ├── DayModal.tsx        # Modal nhập/xem dữ liệu
│   ├── Legend.tsx          # Chú thích màu sắc
│   └── ScoreInputCard.tsx  # Card điểm từng trung đội
├── lib/
│   └── types.ts            # Types, constants, helpers
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icons)
- **Google Fonts** — Nunito + Baloo 2
