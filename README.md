# 路由管理器

记录每次跳转的`vue-route name`, 内置了一些处理回退的方法, 方便回退到**指定页面**

## 背景

笔者所开发的项目中经常遇到各种**花式跳转**, 例如从**引导页的选择操作**到最后的**提交审核**中间会经过无数页面, 甚至中间所做的**操作不同**也会导致最后**回退深度不同**

假设项目中 起始点都是`选择页`, 最终都会抵达`提交页` 并且都会返回到最初的页面(`选择页`)

```
选择页 --> B --> C --> 提交页
情况一 从选择到提交 中间经历了 B、C, 这时候返回 A 需要调用router.go(-3)
----------------------------------------

选择页 --> B-1 ------> 提交页
情况二 从选择到提交 只经历了 B-1 , 这时候 go(-3) 不再适用, 此时可能会增加查询参数(渠道id)来区分第二种情况
----------------------------------------

选择页 --> B-2 --> C-2 -->C-2-1 --> 提交页
这种情况 又会发现不仅 go(-3) 不适用, 查询参数还得多加一种类型, 如果后续还需要区分更多渠道, 可想而知啊...
```

此时可以使用`RouteManager`插件来处理这一系列复杂的问题

## 入门

```shell
npm i vue-route-manager -S
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

## 解决问题

```
A --> B --> C --> D --返回-> A // 情况一
 |--> B-1 ------> D --返回-> A // 情况二
 |--> B-2 --> C-2 -->C-2-1 --> D --返回-> A // 情况三
```

首先在**A页面**调用`this.$RouteManager.setHome('page-A')`或者`this.$RouteManager.setHome()`

接着**B页面**需要返回的时候调用`this.$RouteManager.backHome()`即可

## Methods

### setHome([name])

- **name**
  - Type: `String`
  - `name`所指路由列表当中的 name `{ path: '/page_3', name: 'page-3', component: Page-3 }`
  - Default: 当前路由的name

设置需要最终返回的页面路由name

### backHome()

回退到`home`页, 通过`setHome`来设置`home`

### backByName(name)

- **name**
  - Type: `String`
  - `name`所指路由列表当中的 name `{ path: '/page_3', name: 'page-3', component: Page-3 }`

回退到指定`name`的页面
