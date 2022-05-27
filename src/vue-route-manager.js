function log(str, any_log) {
	console.log(`%c RouteManager %c ${ str } `,
		'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
		'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
		any_log
	)
}

export class RouteManager {
	constructor({ router, debug }) {
		if (!router) {
			throw Error('\n vue-router is necessary. \n\n');
		}
		this.debug = debug
		/**@type {VueRouter}*/
		this.$router = router

		/**@type {Array | null}*/
		this.routePathList = []

		/**@type {String | null}*/
		this.homeName = null

		/**@type {string|null}*/
		this.firstName = null

		/**@type {string|null}*/
		this.currentRouteName = null

		// 是否为单页面
		// this.isSingleRoute = true
		setTimeout(() => {
			/**@type {Vue}*/
			this.$app = this.$router.app
			this.init()
		})

		this.tempStorKey = 'tempRouteManagerStor'
		/**@type {'push'|'back'|'replace'|'forward'}*/
		this.routeAction = ''
	}

	static getInstance(params) {
		if (!RouteManager.instance) {
			RouteManager.instance = new RouteManager(params);
		}
		return RouteManager.instance;
	}

	init() {
		this._refreshStateArr = ['__beforeunload', '__unload']

		window.onbeforeunload = () => {
			localStorage.setItem('__beforeunload', 'true')
			this._setTempStor()
		}
		window.onunload = () => {
			localStorage.setItem('__unload', 'true')
		}
		window.onload = () => {
			let arr = this._refreshStateArr.map(_ => localStorage.getItem(_) === 'true')
			if (arr.every(_ => _)) {
				Object.assign(this, this._getTempStor())
				this._refreshStateArr.forEach(item => {
					localStorage.removeItem(item)
				})
			}
		}

		const routerReplace = this.$router.replace.bind(this.$router);
		let isReplace = false
		this.$router.replace = (location, onResolve, onReject) => {
			isReplace = true
			this.routeAction = 'replace'
			if (onResolve || onReject) {
				return routerReplace(location, onResolve, onReject);
			}
			return routerReplace(location)
				.catch(error => error);
		};



		this.$router.beforeHooks.push((to, from, next) => {
			this.currentRouteName = this.$app.$route.name
			// console.log('当前: ', this.currentRouteName)
			// console.log(from.name, to.name)

			this.debug && console.log(this.routePathList, '前')

			if (!this.routePathList.length) {
				this.firstName = this.$app.$route.name
				this.recordPath(!from.name, from.name)
				this.debug && console.log(this.routePathList, '初次')
				next()
				return;
			}

			if (!this.routePathList.includes(to.name)) {
				this.recordPath(!from.name, from.name)
			} else {
				this._removePath()
			}

			if (isReplace) {
				this.debug && console.log('replace')
				isReplace = false
				// let len = this.routePathList.length
				this.routePathList = this.routePathList.filter(_ => _ !== from.name)
			}

			this.debug && console.log(this.routePathList, '后')
			// sessionStorage.setItem('ROUTE_STOCK', JSON.stringify(this.routePathList))
			next()
		})
	}

	// 设置临时仓库
	_setTempStor() {
		/**
		 * @typedef tempStorProps
		 * @property   {Array}  routePathList
		 * @property   {string}  homeName
		 * @property   {string}  firstName
		 */
		sessionStorage.setItem(this.tempStorKey, JSON.stringify({
			routePathList: this.routePathList,
			homeName: this.homeName || this.firstName,
			firstName: this.firstName
		}))
	}

	/**@return {tempStorProps}*/
	_getTempStor() {
		return JSON.parse(sessionStorage.getItem(this.tempStorKey))
	}

	_removePath() {
		if (!this.routePathList) return
		this.routePathList.pop()
	}

	/**
	 * 记录路由路径
	 * @param {boolean}  is_init  是否需要初始化
	 * @param {string}  [name]  添加的路径
	 */
	recordPath(is_init, name) {
		if (typeof is_init !== 'boolean') throw `请检查 is_init 类型, 当前类型非 Boolean`
		let routeName = name || this.$app.$route.name
		let s = new Set(this.routePathList)
		if (!routeName) return
		if(s.has(routeName)) console.warn('标识符 route-name 是唯一的, 当前已有:'+routeName)
		s.add(routeName)
		this.routePathList = [...s]
	}

	backByName(name, deviation = 1) {
		this.backToName(name, deviation)
	}

	/**
	 * 根据 route name 返回到指定页面
	 * @param {string}   name  路由 name
	 * @param {number}   [deviation = 1]  额外回退层级
	 */
	backToName(name, deviation = 1){
		let reverseArr = this.routePathList.reverse()
		let index = reverseArr.indexOf(name)
		if (index < 0) {
			throw `未找到${ name }路由`
		}
		reverseArr.splice(0, index+deviation)
		this.$router.go(-(index+deviation))
		this.routePathList.splice(0, Infinity, ...reverseArr.reverse())
	};

	/**
	 * 返回到首页, 需要预先设置 home (用 setHome 方法设置 home name)
	 */
	backHome() {
		if (!this.homeName) throw '未找到 home name (请用 setHome 方法设置 home name)'
		this.backToName(this.homeName)
		this.homeName = null
	}

	/**
	 * 设置 根路由的name
	 * @param {string}   [name]
	 */
	setHome(name) {
		this.homeName = name ? name : this.currentRouteName
	}

}
