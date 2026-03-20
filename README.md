# TezMovies Mobile App

Ứng dụng mobile xem phim được xây dựng bằng **React Native + Expo**, chuyển đổi từ phiên bản web React.

## Tính năng

- **Trang chủ**: Slider phim nổi bật, danh sách phim theo thể loại, phim mới cập nhật
- **Chi tiết phim**: Thông tin phim, trailer, danh sách tập, đề xuất, bình luận
- **Xem phim**: Trình phát video nhúng (WebView), chọn server, chọn tập
- **Tìm kiếm**: Tìm phim theo tên
- **Thể loại & Quốc gia**: Duyệt phim theo thể loại, quốc gia, loại phim
- **Đăng nhập/Đăng ký**: Email + mật khẩu, Google OAuth
- **Yêu thích**: Thêm/xóa phim yêu thích
- **Lịch sử xem**: Theo dõi tiến độ xem phim
- **Thông báo**: Nhận thông báo từ hệ thống
- **Bình luận**: Bình luận & trả lời bình luận trên phim
- **Watch Party**: Xem phim cùng bạn bè (tạo phòng, chat, đồng bộ phát)
- **Admin**: Dashboard, quản lý users, crawler phim, quản lý thông báo & bình luận

## Cấu trúc dự án

```
mobile-app/
├── App.js                    # Entry point
├── app.json                  # Expo config
├── babel.config.js
├── package.json
└── src/
    ├── components/
    │   ├── common/           # LoadingSpinner, CachedImage, Badge
    │   ├── Comment/          # CommentSection
    │   └── Movie/            # MovieCard, MovieSection, MovieSlider
    ├── constants/
    │   ├── config.js         # API URLs, colors, spacing, fonts
    │   └── movie.js          # Categories, countries
    ├── context/
    │   ├── AuthContext.js     # Login/logout, token management
    │   ├── FavoritesContext.js
    │   ├── NotificationContext.js
    │   ├── UserContext.js
    │   └── WatchHistoryContext.js
    ├── navigation/
    │   ├── linking.js         # Deep linking config
    │   ├── MainTabs.js        # Bottom tab navigator
    │   ├── RootNavigator.js   # Root stack navigator
    │   └── stacks/            # Tab stack navigators
    ├── screens/
    │   ├── Home/              # HomeScreen
    │   ├── Movie/             # MovieDetailScreen, WatchMovieScreen
    │   ├── Category/          # CategoryDetailScreen, TopicsScreen
    │   ├── Search/            # SearchScreen
    │   ├── Auth/              # Login, Register, AuthCallback, Verify
    │   ├── Account/           # Account, Profile, Favorites, WatchHistory
    │   ├── Notifications/     # NotificationsScreen
    │   ├── WatchParty/        # WatchPartyScreen, WatchPartyRoomScreen
    │   └── Admin/             # Dashboard, Users, Crawler, Notifications
    └── services/
        ├── apiClient.js       # Axios instance with auth interceptor
        ├── movieApi.js        # Movie API (phimapi.com)
        └── watchPartySocket.js # Socket.IO client
```

## Cài đặt

### Yêu cầu

- Node.js >= 18
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app trên điện thoại (hoặc Android/iOS emulator)

### Bước 1: Cài đặt dependencies

```bash
cd mobile-app
npm install
```

### Bước 2: Cấu hình API

Mở file `src/constants/config.js` và cập nhật `API_URL` trỏ đến backend server:

```javascript
export const API_URL = 'https://your-backend-url.com';
```

### Bước 3: Chạy ứng dụng

```bash
# Khởi động Expo dev server
npx expo start

# Hoặc chạy trực tiếp trên platform
npx expo start --android
npx expo start --ios
```

Quét mã QR bằng Expo Go app trên điện thoại để chạy ứng dụng.

## Build cho production

### Android (APK/AAB)

```bash
# Build APK
npx expo build:android -t apk

# Hoặc dùng EAS Build (recommended)
npm install -g eas-cli
eas build --platform android
```

### iOS (IPA)

```bash
# Cần macOS + Apple Developer account
eas build --platform ios
```

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| React Native 0.74 | UI Framework |
| Expo SDK 51 | Development platform |
| React Navigation 6 | Điều hướng (Stack, Bottom Tabs) |
| Axios | HTTP requests |
| Socket.IO Client | Real-time (Watch Party) |
| Expo SecureStore | Lưu token an toàn |
| Expo WebBrowser | Google OAuth |
| Expo ImagePicker | Chọn avatar |
| React Native WebView | Trình phát video nhúng |

## Lưu ý

- Video phát qua WebView nhúng (link_embed) nên phụ thuộc vào nguồn phim
- Watch Party sử dụng Socket.IO, cần backend hỗ trợ namespace `/watch-party`
- Google OAuth cần cấu hình redirect URI phù hợp với Expo scheme
- Admin features chỉ hiển thị khi user có role `admin`
- App sử dụng dark theme mặc định (#0f0f23)
