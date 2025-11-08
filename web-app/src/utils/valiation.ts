// 验证大陆手机号格式
export const validateCNPhoneNumber = (phoneNumber: string) => {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phoneNumber);
};
