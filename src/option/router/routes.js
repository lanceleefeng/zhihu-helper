const routes = [
  {
    path: "/",
    name: "OptionTemplate",
    title: "选项页面模板",
    // component: () => import("layouts/OptionLayout.vue"),
    // component: () => import("option/layouts/OptionLayout.vue"),
    component: () => import("../layouts/OptionLayout.vue"),
    children: [
      {
        path: "/history",
        name: "history",
        title: "浏览记录",
        component: () => import("../pages/History.vue"),
        meta: {
          requireAuth: false
        }
      },
      {
        path: "/settings",
        name: "settings",
        title: "设置",
        component: () => import("../pages/Settings")
      }
    ]
  }
];

// Always leave this as last one

/*

if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}
*/

export default routes;
