import VueRouter from "vue-router";

export type ManagerOptions = {
	/** VueRouter */
	router: VueRouter;

	/** 是否开启打印信息 */
	debug: boolean

};

export declare class RouteManagerInstance{
	// constructor(options: ManagerOptions)

	/** 根据 route name 返回到指定页面 */
	backByName(name: string): void;

	/** 返回到首页, 需要预先设置 home (用 setHome 方法设置 home name) */
	backHome(): void;

	/** 设置 根路由的name, 默认为当前路由 name */
	// @ts-ignore
	setHome(name?: string): void;
}


declare module 'vue/types/vue' {
	interface Vue {
		/** 路由管理器, 记录每次跳转的 route name, 内置了 返回方法, 方便返回到指定页面*/
		$RouteManager: RouteManagerInstance
	}
}
