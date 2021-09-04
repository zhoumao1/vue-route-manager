# 路由管理器
记录每次跳转的`vue-route name`, 内置了一些处理回退的方法, 方便回退到**指定页面**

项目当中可能会遇到一些跳转的问题, 例如

```
A --> B --> C --> D
此时需要从 D 返回的 A, 通常写法 router.go(-3)

如果此时也遇到 B --> C --> D 此时 router.go(-3) 将不再适用
```

当然此插件就是为了解决这种花式回退

## 入门

```shell
npm i vue-route-manarge -S
```

```js
import Vue from 'vue'

// 引入 路由管理器
import VueRouteManager from 'vue-route-manager'

// 并将其挂载到 Vue 上
Vue.use(VueRouteManager, { /* ...ManagerOptions */ })

// 此时在页面中可以用 this.$RouteManager 来访问管理器
```

#### `ManagerOptions`参数说明

| 参数名 | 类型        | 必须 | 描述            |
| ------ | ----------- | ---- | --------------- |
| router | `VueRouter` | Y    | `VueRouter`对象 |
| debug  | `Boolean`   | N    | 是否开启调试    |

#### 示例

Home 页

路由信息 `{ path: '/home', name: 'home', component: Home }`

```vue
<template>
	<button @click="jump">下一页</button>
</template>
<script>
exprot default {
   methods: {
      jump(){
         // 记录首页的 name
         this.$RouteManager.setHome('home')
         this.$router.push({ name: 'page-1' })
      }
   }
}
</script>
```

Page-1 页

路由信息 `{ path: '/page_1', name: 'page-1', component: Page-1 }`

```vue
<template>
	<div class="page-1">
		page-1
		<button @click="$router.push({ name: 'page-2' })">下一页</button>
		<button @click="$router.replace({ name: 'page-1' })">重定向</button>
	</div>
</template>
```

Page-2 页

路由信息 `{ path: '/page_2', name: 'page-2', component: Page-2 }`

```vue
<template>
	<div class="page-2">
		page-2
		<button @click="$router.push({ name: 'page-3' })">下一页</button>
		<button @click="backToHome">返回首页</button>
	</div>
</template>
<script>
exprot default {
   methods: {
      backToHome(){
         // 调用 backHome 来返回到最开始记录的 home 页
         this.$RouteManager.backHome()
      }
   }
}
</script>
```

Page-3 页

路由信息 `{ path: '/page_3', name: 'page-3', component: Page-3 }`

```vue
<template>
  <div class="page-3">
    page-3
    <button @click="$backToHome">返回首页</button>
    <button @click="backToPage">返回 page-1</button>
  </div>
</template>
exprot default {
   methods: {
      backToPage(){
         // 调用 backByName 来返回到指定页(必须经历过此页面)
         this.$RouteManager.backByName('page-1')
      },
		backToHome(){
         // 调用 backHome 来返回到最开始记录的 home 页
         this.$RouteManager.backHome()
      }
   }
}
</script>
```

## Methods

#### setHome(name)

- **name**
  - Type: `String`
  - `name`所指路由列表当中的 name `{ path: '/page_3', name: 'page-3', component: Page-3 }`

设置需要最终返回的页面路由name

#### backHome()

回退到`home`页, 通过`setHome`来设置`home`

#### backByName(name)

- **name**

  - Type: `String`
  - `name`所指路由列表当中的 name `{ path: '/page_3', name: 'page-3', component: Page-3 }`

回退到指定`name`的页面