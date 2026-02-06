/**
 * QQ空间导出Demo - 分享数据
 */
var dataList = [
    {
        id: 1,
        share_type: "link",
        title: "GitHub - 全球最大的代码托管平台",
        source: "github.com",
        source_url: "https://github.com/",
        summary: "GitHub是全球最大的代码托管平台，数百万开发者在这里协作开发开源项目。",
        cover: "https://picsum.photos/seed/share1/400/300",
        create_time: "2024-01-18 10:30:00",
        comment: "程序员必备工具，强烈推荐！",
        likes: 56,
        comments: [
            {
                user: "技术宅",
                avatar: "https://i.pravatar.cc/100?img=11",
                content: "确实好用，每天都在用",
                time: "2024-01-18 11:20:00"
            }
        ]
    },
    {
        id: 2,
        share_type: "music",
        title: "晴天 - 周杰伦",
        source: "QQ音乐",
        source_url: "https://y.qq.com/",
        summary: "经典歌曲，满满的青春回忆",
        cover: "https://picsum.photos/seed/share2/400/300",
        create_time: "2024-01-16 18:45:00",
        comment: "每次听到这首歌都会想起学生时代 🎵",
        likes: 128,
        comments: [
            {
                user: "音乐达人",
                avatar: "https://i.pravatar.cc/100?img=12",
                content: "周杰伦永远的神！",
                time: "2024-01-16 19:00:00"
            },
            {
                user: "怀旧党",
                avatar: "https://i.pravatar.cc/100?img=13",
                content: "高中时候的回忆啊",
                time: "2024-01-16 20:30:00"
            }
        ]
    },
    {
        id: 3,
        share_type: "article",
        title: "2024年科技行业十大趋势预测",
        source: "36氪",
        source_url: "https://36kr.com/",
        summary: "AI、元宇宙、新能源...2024年科技行业将迎来哪些重大变革？本文为您深度解析。",
        cover: "https://picsum.photos/seed/share3/400/300",
        create_time: "2024-01-14 09:15:00",
        comment: "干货满满的文章，值得一读",
        likes: 89,
        comments: []
    },
    {
        id: 4,
        share_type: "video",
        title: "【4K】航拍中国 - 云南篇",
        source: "B站",
        source_url: "https://www.bilibili.com/",
        summary: "从空中俯瞰彩云之南，领略云南的壮美风光。",
        cover: "https://picsum.photos/seed/share4/400/300",
        create_time: "2024-01-12 20:00:00",
        comment: "太美了！想去云南旅游了 ✈️",
        likes: 256,
        comments: [
            {
                user: "旅行者",
                avatar: "https://i.pravatar.cc/100?img=14",
                content: "去过云南，真的很美！",
                time: "2024-01-12 21:00:00"
            },
            {
                user: "摄影爱好者",
                avatar: "https://i.pravatar.cc/100?img=15",
                content: "画质太棒了",
                time: "2024-01-13 08:30:00"
            },
            {
                user: "风景控",
                avatar: "https://i.pravatar.cc/100?img=16",
                content: "种草了！",
                time: "2024-01-13 10:00:00"
            }
        ]
    },
    {
        id: 5,
        share_type: "link",
        title: "ChatGPT - OpenAI",
        source: "openai.com",
        source_url: "https://chat.openai.com/",
        summary: "OpenAI开发的大型语言模型，可以进行自然对话、写作、编程等多种任务。",
        cover: "https://picsum.photos/seed/share5/400/300",
        create_time: "2024-01-10 14:30:00",
        comment: "AI时代来了，这个工具太强大了！",
        likes: 312,
        comments: [
            {
                user: "AI探索者",
                avatar: "https://i.pravatar.cc/100?img=17",
                content: "改变世界的产品",
                time: "2024-01-10 15:00:00"
            }
        ]
    },
    {
        id: 6,
        share_type: "article",
        title: "程序员的自我修养：如何写出优雅的代码",
        source: "掘金",
        source_url: "https://juejin.cn/",
        summary: "好的代码不仅能运行，更要易读、易维护。本文分享一些编写优雅代码的心得。",
        cover: "https://picsum.photos/seed/share6/400/300",
        create_time: "2024-01-08 11:00:00",
        comment: "作为程序员，代码质量真的很重要",
        likes: 167,
        comments: [
            {
                user: "码农小王",
                avatar: "https://i.pravatar.cc/100?img=18",
                content: "说得太对了！",
                time: "2024-01-08 12:30:00"
            },
            {
                user: "架构师",
                avatar: "https://i.pravatar.cc/100?img=19",
                content: "代码要像诗一样优美",
                time: "2024-01-08 14:00:00"
            }
        ]
    },
    {
        id: 7,
        share_type: "music",
        title: "Counting Stars - OneRepublic",
        source: "网易云音乐",
        source_url: "https://music.163.com/",
        summary: "OneRepublic的热门单曲，充满活力的旋律让人忍不住跟着节奏摇摆。",
        cover: "https://picsum.photos/seed/share7/400/300",
        create_time: "2024-01-05 22:00:00",
        comment: "超级好听！循环播放中 🎶",
        likes: 98,
        comments: []
    }
];

// 分享类型映射
var typeMap = {
    "link": { name: "链接", icon: "🔗", color: "#4A90E2" },
    "music": { name: "音乐", icon: "🎵", color: "#E24A90" },
    "video": { name: "视频", icon: "🎬", color: "#E2904A" },
    "article": { name: "文章", icon: "📰", color: "#4AE290" }
};
