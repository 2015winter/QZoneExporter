// Demo 说说数据
var messages = [
    {
        tid: "msg001",
        uin: 12345678,
        name: "青春纪念册",
        content: "今天天气真好！和朋友们一起去公园踏青，拍了很多好看的照片 📸 春天真的是一年中最美的季节了，万物复苏，充满希望。\n\n#春日记录 #美好时光",
        custom_create_time: "2024-03-15 14:30:00",
        created_time: 1710484200,
        lbs: {
            pos_x: 116.397128,
            pos_y: 39.916527,
            idname: "北京市",
            name: "朝阳公园"
        },
        source_name: "iPhone 15 Pro",
        custom_images: [
            { pic_id: "img001", custom_url: "https://picsum.photos/800/600?random=1", width: 800, height: 600 },
            { pic_id: "img002", custom_url: "https://picsum.photos/800/600?random=2", width: 800, height: 600 },
            { pic_id: "img003", custom_url: "https://picsum.photos/800/600?random=3", width: 800, height: 600 }
        ],
        custom_comments: [
            {
                uin: 88888888,
                name: "好友小明",
                content: "照片拍的真好看！下次带我一起去呀 😊",
                postTime: 1710485000,
                pic: []
            },
            {
                uin: 99999999,
                name: "闺蜜小红",
                content: "春天真美！我也想去踏青了~",
                postTime: 1710486000,
                replies: [
                    {
                        uin: 12345678,
                        name: "青春纪念册",
                        content: "下周末一起约！",
                        postTime: 1710487000
                    }
                ]
            }
        ],
        likeTotal: 66,
        custom_visitor: { viewCount: 328 }
    },
    {
        tid: "msg002",
        uin: 12345678,
        name: "青春纪念册",
        content: "周末在家研究新买的咖啡机 ☕ 终于学会拉花了！虽然还是有点丑，但是味道很不错。生活需要仪式感，每天早上一杯手冲咖啡，开启美好的一天。",
        custom_create_time: "2024-03-10 09:15:00",
        created_time: 1710033300,
        source_name: "Android",
        custom_images: [
            { pic_id: "img004", custom_url: "https://picsum.photos/600/800?random=4", width: 600, height: 800 }
        ],
        custom_comments: [
            {
                uin: 77777777,
                name: "咖啡爱好者",
                content: "拉花不错啊！比我第一次强多了",
                postTime: 1710034000
            }
        ],
        likeTotal: 42,
        custom_visitor: { viewCount: 156 }
    },
    {
        tid: "msg003",
        uin: 12345678,
        name: "青春纪念册",
        content: "分享一首最近单曲循环的歌 🎵\n\n有些歌听着听着就哭了，不是因为歌词有多动人，而是因为它让你想起了某个人、某段时光。\n\n音乐真的是时光机，一首歌就能把我们带回过去。",
        custom_create_time: "2024-03-05 22:00:00",
        created_time: 1709650800,
        source_name: "QQ音乐",
        likeTotal: 89,
        custom_visitor: { viewCount: 445 }
    },
    {
        tid: "msg004",
        uin: 12345678,
        name: "青春纪念册",
        content: "转发一条好友的说说~",
        custom_create_time: "2024-02-28 18:30:00",
        created_time: 1709115000,
        rt_tid: "rt001",
        rt_uin: 66666666,
        rt_uinname: "旅行达人",
        rt_con: "云南之旅完美收官！丽江古城的夜景真的太美了，感觉自己像是穿越到了另一个世界。推荐大家有机会一定要来看看！\n\n#云南旅行 #丽江古城",
        custom_images: [
            { pic_id: "img005", custom_url: "https://picsum.photos/800/600?random=5", width: 800, height: 600 },
            { pic_id: "img006", custom_url: "https://picsum.photos/800/600?random=6", width: 800, height: 600 }
        ],
        source_name: "QQ空间",
        likeTotal: 35,
        custom_visitor: { viewCount: 198 }
    },
    {
        tid: "msg005",
        uin: 12345678,
        name: "青春纪念册",
        content: "新年第一天，给自己定了几个小目标：\n\n📚 每月读两本书\n🏃 每周运动三次\n✈️ 至少去两个没去过的城市\n📝 坚持写日记\n💪 学习一项新技能\n\n希望年底回顾的时候，都能完成！加油！",
        custom_create_time: "2024-01-01 00:05:00",
        created_time: 1704038700,
        source_name: "iPhone 15 Pro",
        custom_comments: [
            {
                uin: 55555555,
                name: "元气满满",
                content: "一起加油！我也要好好规划新的一年",
                postTime: 1704040000
            },
            {
                uin: 44444444,
                name: "懒癌患者",
                content: "我的目标就是活着就行 😂",
                postTime: 1704041000
            }
        ],
        likeTotal: 128,
        custom_visitor: { viewCount: 567 }
    },
    {
        tid: "msg006",
        uin: 12345678,
        name: "青春纪念册",
        content: "2023年的最后一天，感谢这一年所有的经历，无论是欢笑还是泪水，都让我成长了很多。\n\n再见2023，你好2024！🎆",
        custom_create_time: "2023-12-31 23:59:00",
        created_time: 1704038340,
        source_name: "QQ空间",
        custom_images: [
            { pic_id: "img007", custom_url: "https://picsum.photos/800/600?random=7", width: 800, height: 600 },
            { pic_id: "img008", custom_url: "https://picsum.photos/600/800?random=8", width: 600, height: 800 },
            { pic_id: "img009", custom_url: "https://picsum.photos/800/600?random=9", width: 800, height: 600 },
            { pic_id: "img010", custom_url: "https://picsum.photos/800/800?random=10", width: 800, height: 800 },
            { pic_id: "img011", custom_url: "https://picsum.photos/800/600?random=11", width: 800, height: 600 },
            { pic_id: "img012", custom_url: "https://picsum.photos/600/800?random=12", width: 600, height: 800 }
        ],
        likeTotal: 256,
        custom_visitor: { viewCount: 1024 }
    },
    {
        tid: "msg007",
        uin: 12345678,
        name: "青春纪念册",
        content: "圣诞快乐！🎄🎅\n\n今年的圣诞节是和家人一起过的，虽然没有下雪，但是屋子里暖暖的，幸福满满。",
        custom_create_time: "2023-12-25 20:00:00",
        created_time: 1703505600,
        source_name: "微信",
        custom_images: [
            { pic_id: "img013", custom_url: "https://picsum.photos/800/600?random=13", width: 800, height: 600 }
        ],
        likeTotal: 88,
        custom_visitor: { viewCount: 356 }
    },
    {
        tid: "msg008",
        uin: 12345678,
        name: "青春纪念册",
        content: "终于把拖延了一个月的项目做完了！熬了好几个通宵，但是看到成果还是很有成就感的。\n\n今晚要好好睡一觉，明天开始放松一下 😴",
        custom_create_time: "2023-11-20 03:30:00",
        created_time: 1700422200,
        source_name: "Windows",
        likeTotal: 45,
        custom_visitor: { viewCount: 234 }
    }
];
