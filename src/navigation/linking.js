// Deep linking configuration
export const linking = {
  prefixes: ['tezmovies://', 'https://tezmovies.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              Home: '',
              MovieDetail: 'phim/:slug',
              WatchMovie: 'xem-phim/:slug',
              CategoryDetail: ':describe/:slug',
              CategoryList: 'danh-sach/:typeList',
              Search: 'search',
              Topics: 'chu-de',
            },
          },
          FavoritesTab: {
            screens: {
              Favorites: 'account/favorites',
            },
          },
          HistoryTab: {
            screens: {
              WatchHistory: 'account/watch-history',
            },
          },
          NotificationsTab: {
            screens: {
              Notifications: 'notifications',
            },
          },
          AccountTab: {
            screens: {
              Account: 'account',
              Profile: 'account/profile',
              AdminDashboard: 'admin',
              UserManagement: 'admin/users',
              MovieCrawler: 'admin/crawler',
              AdminNotifications: 'admin/notifications',
            },
          },
        },
      },
      WatchParty: 'watch-party',
      WatchPartyRoom: 'watch-party/:roomId',
      Login: 'login',
      Register: 'register',
      AuthCallback: 'auth/callback',
      Verify: 'verify/:token',
    },
  },
};
