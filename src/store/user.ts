import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('k12_token') || '',
    userInfo: JSON.parse(localStorage.getItem('k12_user') || '{}')
  }),
  actions: {
    setLoginData(data: { access_token: string; user: any }) {
      this.token = data.access_token;
      this.userInfo = data.user;
      localStorage.setItem('k12_token', data.access_token);
      localStorage.setItem('k12_user', JSON.stringify(data.user));
    },
    logout() {
      this.token = '';
      this.userInfo = {};
      localStorage.removeItem('k12_token');
      localStorage.removeItem('k12_user');
    }
  }
});
