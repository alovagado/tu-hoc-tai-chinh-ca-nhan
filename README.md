# Hành trình tài chính: bản deploy lên Netlify có thu thập dữ liệu

## Cấu trúc
- `public/index.html`: trò chơi (đã gắn mã gửi dữ liệu, chỉ gửi khi người chơi bấm đồng ý).
- `netlify/functions/track.mjs`: nhận dữ liệu tại `/api/track`, lưu vào Netlify Blobs.
- `netlify/functions/export.mjs`: tải dữ liệu tại `/api/export` (cần mật khẩu).
- `netlify.toml`, `package.json`: cấu hình cho Netlify.

Lưu ý: kéo thả (Netlify Drop) KHÔNG chạy được phần Functions. Hãy dùng GitHub hoặc Netlify CLI.

## Cách 1: Qua GitHub (khuyên dùng)
1. Tạo repository mới trên GitHub, tải lên toàn bộ thư mục này, giữ nguyên cấu trúc.
2. Vào app.netlify.com → Add new project → Import an existing project → GitHub → chọn repository.
3. Để trống Build command. Publish directory: `public`. Bấm Deploy.
4. Vào Project configuration → Environment variables → thêm biến `EXPORT_KEY` với một mật khẩu dài, khó đoán.
5. Vào Deploys → Trigger deploy → Deploy project để biến môi trường có hiệu lực.

## Cách 2: Qua Netlify CLI
```bash
npm install
npx netlify-cli login
npx netlify-cli init        # tạo project mới
npx netlify-cli env:set EXPORT_KEY "mat-khau-dai-kho-doan"
npx netlify-cli deploy --prod
```

## Xem dữ liệu
- Trong Netlify: Project → Blobs → kho `events`.
- Tải CSV: `https://<trang-cua-ban>.netlify.app/api/export?key=<EXPORT_KEY>&day=2026-11`
- Không chia sẻ link có `key` cho người khác.

## Các loại sự kiện
| type | Khi nào | Dữ liệu chính |
|---|---|---|
| game_start | Bắt đầu ván | nhân vật, độ khó, số liệu tự nhập, bậc xuất phát |
| quarter_plan | Chốt kế hoạch mỗi quý | tài sản ròng, nợ, kỷ luật, hạnh phúc, cách chia tiền, nguồn thu, việc học |
| decision | Mỗi lựa chọn trong biến cố | mã biến cố, lựa chọn, tác động ngắn hạn và dài hạn, đúng/sai câu đố |
| action | Mở/đóng kinh doanh, đi học, nghỉ việc, đổi lối sống… | hành động, quý, tài sản ròng |
| game_abandon | Bấm "Ván mới" khi ván chưa kết thúc | trạng thái lúc bỏ, biến cố cuối cùng |
| game_end | Kết thúc ván | trạng thái cuối, bậc cao nhất, tổng lãi đã trả |

`pid` là mã người chơi ngẫu nhiên lưu trong trình duyệt; `gid` là mã từng ván.

## Quyền riêng tư
Dữ liệu chỉ được gửi khi người chơi tự bấm đồng ý. Không thu thập tên, email, số điện thoại.
Phần "Tình trạng của tôi" chứa số liệu tài chính thật do người chơi tự nhập: hãy nêu rõ mục đích sử dụng
trong chính sách quyền riêng tư và cho phép người chơi yêu cầu xóa dữ liệu theo mã người chơi.
