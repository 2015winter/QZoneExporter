/**
 * QQ空间导出Demo - 访客数据
 */
var dataList = [
    {
        id: 1,
        uin: "10001",
        name: "阳光女孩",
        avatar: "https://i.pravatar.cc/100?img=21",
        visit_time: "2024-01-20 15:30:00",
        visit_count: 128,
        source: "说说",
        is_friend: true,
        last_visit: "2024-01-20 15:30:00"
    },
    {
        id: 2,
        uin: "10002",
        name: "夜空中最亮的星",
        avatar: "https://i.pravatar.cc/100?img=22",
        visit_time: "2024-01-20 14:15:00",
        visit_count: 56,
        source: "相册",
        is_friend: true,
        last_visit: "2024-01-20 14:15:00"
    },
    {
        id: 3,
        uin: "10003",
        name: "匿名用户",
        avatar: "https://i.pravatar.cc/100?img=23",
        visit_time: "2024-01-20 12:00:00",
        visit_count: 3,
        source: "首页",
        is_friend: false,
        last_visit: "2024-01-20 12:00:00"
    },
    {
        id: 4,
        uin: "10004",
        name: "技术宅小明",
        avatar: "https://i.pravatar.cc/100?img=24",
        visit_time: "2024-01-19 22:45:00",
        visit_count: 89,
        source: "日志",
        is_friend: true,
        last_visit: "2024-01-19 22:45:00"
    },
    {
        id: 5,
        uin: "10005",
        name: "旅行的意义",
        avatar: "https://i.pravatar.cc/100?img=25",
        visit_time: "2024-01-19 18:30:00",
        visit_count: 34,
        source: "相册",
        is_friend: true,
        last_visit: "2024-01-19 18:30:00"
    },
    {
        id: 6,
        uin: "10006",
        name: "匿名用户",
        avatar: "https://i.pravatar.cc/100?img=26",
        visit_time: "2024-01-19 16:00:00",
        visit_count: 1,
        source: "首页",
        is_friend: false,
        last_visit: "2024-01-19 16:00:00"
    },
    {
        id: 7,
        uin: "10007",
        name: "音乐达人",
        avatar: "https://i.pravatar.cc/100?img=27",
        visit_time: "2024-01-19 10:20:00",
        visit_count: 67,
        source: "说说",
        is_friend: true,
        last_visit: "2024-01-19 10:20:00"
    },
    {
        id: 8,
        uin: "10008",
        name: "摄影爱好者",
        avatar: "https://i.pravatar.cc/100?img=28",
        visit_time: "2024-01-18 21:00:00",
        visit_count: 45,
        source: "相册",
        is_friend: true,
        last_visit: "2024-01-18 21:00:00"
    },
    {
        id: 9,
        uin: "10009",
        name: "匿名用户",
        avatar: "https://i.pravatar.cc/100?img=29",
        visit_time: "2024-01-18 15:30:00",
        visit_count: 2,
        source: "日志",
        is_friend: false,
        last_visit: "2024-01-18 15:30:00"
    },
    {
        id: 10,
        uin: "10010",
        name: "文艺青年",
        avatar: "https://i.pravatar.cc/100?img=30",
        visit_time: "2024-01-18 09:00:00",
        visit_count: 112,
        source: "日记",
        is_friend: true,
        last_visit: "2024-01-18 09:00:00"
    },
    {
        id: 11,
        uin: "10011",
        name: "游戏玩家",
        avatar: "https://i.pravatar.cc/100?img=31",
        visit_time: "2024-01-17 23:45:00",
        visit_count: 28,
        source: "说说",
        is_friend: true,
        last_visit: "2024-01-17 23:45:00"
    },
    {
        id: 12,
        uin: "10012",
        name: "美食博主",
        avatar: "https://i.pravatar.cc/100?img=32",
        visit_time: "2024-01-17 19:30:00",
        visit_count: 76,
        source: "相册",
        is_friend: true,
        last_visit: "2024-01-17 19:30:00"
    }
];

// 访问统计
var statistics = {
    total_visits: 1256,
    today_visits: 23,
    week_visits: 156,
    month_visits: 489,
    unique_visitors: 312,
    friend_visits: 892,
    stranger_visits: 364
};
