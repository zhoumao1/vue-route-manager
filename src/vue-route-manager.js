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
	}

	init() {
		this._refreshStateArr = ['__beforeunload', '__unload']
		window.onbeforeunload = () => {
			localStorage.setItem('__beforeunload', 'true')
			this.setTempStor()
		}
		window.onunload = () => {
			localStorage.setItem('__unload', 'true')
		}
		window.onload = () => {
			let arr = this._refreshStateArr.map(_ => localStorage.getItem(_) === 'true')
			if (arr.every(_ => _)) {
				Object.assign(this, this.getTempStor())
				this._refreshStateArr.forEach(item => {
					localStorage.removeItem(item)
				})
			}
		}
		this.$router.afterHooks.unshift((to, from) => {
			this.debug && console.log(this.routePathList, '前')
			// next()
			this.currentRouteName = to.name

			if (to.name === from.name) {
				this.debug && console.log('replace')
				return
			}
			if (!this.routePathList.length) {
				this.firstName = this.$app.$route.name
				this.recordPath(!from.name)
				this.debug && console.log(this.routePathList, '初次')
				return;
			}
			if (!this.routePathList.includes(to.name)) {
				this.recordPath(!from.name)
			} else {
				this.shiftRoutePath()
			}
			this.debug && console.log(this.routePathList, '后')
		})
	}

	// 设置临时仓库
	setTempStor(){
		/**
		 * @typedef tempStorProps
		 * @property   {Array}  routePathList
		 * @property   {string}  homeName
		 * @property   {string}  firstName
		 */
		sessionStorage.setItem(this.tempStorKey, JSON.stringify({
			routePathList: this.routePathList,
			homeName: this.homeName || this.currentRouteName,
			firstName: this.firstName
		}))
	}

	/**@return {tempStorProps}*/
	getTempStor(){
		return JSON.parse(sessionStorage.getItem(this.tempStorKey))
	}

	shiftRoutePath() {
		if (!this.routePathList) return
		this.routePathList.pop()
	}

	/**
	 * 记录路由路径
	 * @param {boolean}  is_init  是否需要初始化
	 */
	recordPath(is_init) {
		let routeName = this.$app.$route.name
		if (is_init) {
			if (!this.routePathList.includes(routeName)) {
				this.routePathList.push(routeName)
			}
			return;
		}
		this.routePathList.push(routeName)
	}

	/**
	 * 根据 route name 返回到指定页面
	 * @param {string}   name  路由 name
	 */
	backByName(name) {
		let reverseArr = this.routePathList.reverse()
		let index = reverseArr.indexOf(name)
		if (index < 0) {
			throw `未找到${ name }路由`
		}
		reverseArr.splice(0, index)
		this.$router.go(-(index))
		this.routePathList.splice(0, Infinity, ...reverseArr.reverse())
		this.routePathList.push(name)
	}

	/**
	 * 返回到首页, 需要预先设置 home (用 setHome 方法设置 home name)
	 */
	backHome() {
		if (!this.homeName) throw '未找到 home name (请用 setHome 方法设置 home name)'
		this.backByName(this.homeName)
		this.homeName = null
	}

	/**
	 * 设置 根路由的name
	 * @param {string}   name
	 */
	setHome(name) {
		this.homeName = name ? name:this.currentRouteName
	}

}
