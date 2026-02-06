// Demo 相册数据
var albums = [
    {
        id: "album001",
        name: "春日踏青",
        className: "生活记录",
        desc: "2024年春天和朋友们一起去公园踏青，记录下美好的时光。",
        total: 12,
        allowAccess: 1,
        custom_url: "https://picsum.photos/seed/album001/400/300",
        photoList: [
            { lloc: "p001", name: "樱花树下", desc: "盛开的樱花", custom_url: "https://picsum.photos/seed/p001/800/600", uploadTime: 1710484200, likes: [{uin: 111}], comments: [{uin: 222, name: "好友", content: "好美！"}] },
            { lloc: "p002", name: "野餐", desc: "草坪上的野餐", custom_url: "https://picsum.photos/seed/p002/800/600", uploadTime: 1710484300 },
            { lloc: "p003", name: "湖边", desc: "湖边风景", custom_url: "https://picsum.photos/seed/p003/600/800", uploadTime: 1710484400 },
            { lloc: "p004", name: "花丛", desc: "五彩的花丛", custom_url: "https://picsum.photos/seed/p004/800/600", uploadTime: 1710484500 },
            { lloc: "p005", name: "小桥", desc: "古朴的小桥", custom_url: "https://picsum.photos/seed/p005/800/600", uploadTime: 1710484600 },
            { lloc: "p006", name: "夕阳", desc: "夕阳西下", custom_url: "https://picsum.photos/seed/p006/800/600", uploadTime: 1710484700 }
        ],
        likes: [{uin: 111}, {uin: 222}],
        comments: []
    },
    {
        id: "album002",
        name: "美食记录",
        className: "生活记录",
        desc: "记录生活中遇到的美食，吃是人生大事！",
        total: 8,
        allowAccess: 1,
        custom_url: "https://picsum.photos/seed/album002/400/300",
        photoList: [
            { lloc: "p101", name: "火锅", desc: "麻辣火锅", custom_url: "https://picsum.photos/seed/p101/800/600", uploadTime: 1709650800 },
            { lloc: "p102", name: "寿司", desc: "日式寿司", custom_url: "https://picsum.photos/seed/p102/800/600", uploadTime: 1709650900 },
            { lloc: "p103", name: "甜点", desc: "精致甜点", custom_url: "https://picsum.photos/seed/p103/600/800", uploadTime: 1709651000 },
            { lloc: "p104", name: "咖啡", desc: "拿铁拉花", custom_url: "https://picsum.photos/seed/p104/800/600", uploadTime: 1709651100 }
        ],
        likes: [{uin: 333}],
        comments: []
    },
    {
        id: "album003",
        name: "云南之旅",
        className: "旅行相册",
        desc: "2023年12月的云南之行，大理、丽江，风景如画。",
        total: 20,
        allowAccess: 1,
        custom_url: "https://picsum.photos/seed/album003/400/300",
        photoList: [
            { lloc: "p201", name: "洱海", desc: "碧蓝的洱海", custom_url: "https://picsum.photos/seed/p201/800/600", uploadTime: 1702200000 },
            { lloc: "p202", name: "苍山", desc: "云雾缭绕的苍山", custom_url: "https://picsum.photos/seed/p202/800/600", uploadTime: 1702200100 },
            { lloc: "p203", name: "古城", desc: "丽江古城夜景", custom_url: "https://picsum.photos/seed/p203/600/800", uploadTime: 1702200200 },
            { lloc: "p204", name: "纳西族建筑", desc: "特色建筑", custom_url: "https://picsum.photos/seed/p204/800/600", uploadTime: 1702200300 },
            { lloc: "p205", name: "雪山", desc: "玉龙雪山", custom_url: "https://picsum.photos/seed/p205/800/600", uploadTime: 1702200400 },
            { lloc: "p206", name: "蓝月谷", desc: "蓝月谷风光", custom_url: "https://picsum.photos/seed/p206/800/600", uploadTime: 1702200500 },
            { lloc: "p207", name: "束河古镇", desc: "宁静的束河", custom_url: "https://picsum.photos/seed/p207/800/600", uploadTime: 1702200600 },
            { lloc: "p208", name: "日出", desc: "洱海日出", custom_url: "https://picsum.photos/seed/p208/800/600", uploadTime: 1702200700 }
        ],
        likes: [{uin: 111}, {uin: 222}, {uin: 333}, {uin: 444}],
        comments: [{uin: 555, name: "旅行达人", content: "太美了！种草了！"}]
    },
    {
        id: "album004",
        name: "日常随拍",
        className: "生活记录",
        desc: "生活中的小确幸，随手记录。",
        total: 15,
        allowAccess: 1,
        custom_url: "https://picsum.photos/seed/album004/400/300",
        photoList: [
            { lloc: "p301", name: "猫咪", desc: "邻居家的猫", custom_url: "https://picsum.photos/seed/p301/800/600", uploadTime: 1704067200 },
            { lloc: "p302", name: "书架", desc: "我的书架", custom_url: "https://picsum.photos/seed/p302/600/800", uploadTime: 1704067300 },
            { lloc: "p303", name: "窗外", desc: "窗外的风景", custom_url: "https://picsum.photos/seed/p303/800/600", uploadTime: 1704067400 },
            { lloc: "p304", name: "花", desc: "桌上的鲜花", custom_url: "https://picsum.photos/seed/p304/800/600", uploadTime: 1704067500 }
        ],
        likes: [],
        comments: []
    },
    {
        id: "album005",
        name: "毕业季",
        className: "校园时光",
        desc: "大学毕业照，致青春！",
        total: 30,
        allowAccess: 1,
        custom_url: "https://picsum.photos/seed/album005/400/300",
        photoList: [
            { lloc: "p401", name: "学士服", desc: "穿学士服的我们", custom_url: "https://picsum.photos/seed/p401/800/600", uploadTime: 1656662400 },
            { lloc: "p402", name: "图书馆", desc: "图书馆前合影", custom_url: "https://picsum.photos/seed/p402/800/600", uploadTime: 1656662500 },
            { lloc: "p403", name: "操场", desc: "最后一次在操场奔跑", custom_url: "https://picsum.photos/seed/p403/800/600", uploadTime: 1656662600 },
            { lloc: "p404", name: "宿舍", desc: "四年的家", custom_url: "https://picsum.photos/seed/p404/600/800", uploadTime: 1656662700 },
            { lloc: "p405", name: "食堂", desc: "最爱的窗口", custom_url: "https://picsum.photos/seed/p405/800/600", uploadTime: 1656662800 }
        ],
        likes: [{uin: 111}, {uin: 222}, {uin: 333}],
        comments: [{uin: 666, name: "老同学", content: "青春不散场！"}]
    }
];
