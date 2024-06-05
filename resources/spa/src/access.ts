/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { user?: API.CurrentUser } | undefined) {
  const { user } = initialState ?? {};
  return {
    canAdmin: user && user.access === 'admin',
  };
}
