import { RouteManager } from './vue-route-manager';

export default {
	install(Vue, options ) {
		Vue.prototype.$RouteManager = new RouteManager(options);
	}
}
