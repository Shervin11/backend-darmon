export const appointments = [
    {
        "id": 1,
        "doctorId": 3,
        "clientId": 6,
        "date": "2026-04-02",
        "time": "14:00",
        "status": "approved",
        "symptoms": "Дили ман тез мезанад",
        "rejectReason": "",
        "createdAt": "2026-03-25T11:30:00Z"
    },
    {
        "id": 2,
        "doctorId": 3,
        "clientId": 7,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саттор Юсупов",
        "specialty": "Терапевт",
        "date": "2026-03-31",
        "time": "11:30",
        "symptoms": "сардард",
        "status": "approved"
    },
    {
        "id": 3,
        "doctorId": 4,
        "clientId": 6,
        "doctorName": "Фаррух Саидзода",
        "clientName": "Зулайхо Ҷабборова",
        "specialty": "Кардиолог",
        "date": "2026-03-28",
        "time": "16:16",
        "symptoms": "сардард",
        "status": "approved"
    },
    {
        "id": 4,
        "doctorId": 3,
        "clientId": 7,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саттор Юсупов",
        "specialty": "Терапевт",
        "date": "2026-04-23",
        "time": "12:30",
        "symptoms": "",
        "status": "approved"
    }
];

export const wishlist = [
    {
        "userId": 6,
        "favorites": [
            {
                "doctorId": 4,
                "name": "Фаррух Саидзода",
                "specialty": "Кардиолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s"
            }
        ],
        "id": 1
    }
];

// ── Users with 4 roles ──────────────────────────
export const users = [
    // ── ADMIN ──
    {
        "id": 1,
        "fullName": "Администратор DARMON",
        "email": "admin@darmon.tj",
        "password": "admin123",
        "role": "admin",
        "phone": "+992 44 600 60 60",
        "image": "",
        "city": "Душанбе"
    },
    // ── CLINIC ──
    {
        "id": 2,
        "fullName": "Клиникаи Сино",
        "email": "sino@darmon.tj",
        "password": "sino123",
        "role": "clinic",
        "phone": "+992 44 700 70 70",
        "image": "",
        "city": "Душанбе",
        "clinicName": "Клиникаи Сино",
        "address": "ш. Душанбе, к. Рудакӣ 100"
    },
    // ── DOCTORS ──
    {
        "id": 3,
        "fullName": "Дилафрӯз Раҳимова",
        "specialty": "Терапевт",
        "experience": 8,
        "recommendation": 100,
        "rating": 4.5,
        "price": {
            "current": 2000,
            "old": 2500,
            "currency": "см"
        },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s",
        "bio": "Табиби таҷрибадор барои муолиҷаи бемориҳои нафас ва умумӣ. Ӯ дорои 8 соли таҷриба буда, бо диққат ва муносибати гарм ба беморон муносибат мекунад.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "09:00", "endTime": "15:00" },
            { "day": "Сешанбе", "startTime": "11:00", "endTime": "17:00" },
            { "day": "Ҷумъа", "startTime": "09:00", "endTime": "14:00" }
        ],
        "comments": [
            {
                "id": 101,
                "user": { "fullName": "Зулайхо Ҷабборова", "image": "https://randomuser.me/api/portraits/women/1.jpg" },
                "rating": 5,
                "comment": "Духтур хеле меҳрубон ва мутахассис аст. Ташаккур!",
                "date": "2025-06-27"
            },
            {
                "id": 102,
                "user": { "fullName": "Саттор Юсупов", "image": "" },
                "rating": 4,
                "comment": "хеле хуб",
                "date": "25.03.2026"
            }
        ],
        "email": "dilafruz.rahimova@example.com",
        "password": "rahimova",
        "role": "doctor",
        "phone": "+992 123 456 789",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 4,
        "fullName": "Фаррух Саидзода",
        "specialty": "Кардиолог",
        "experience": 12,
        "recommendation": 100,
        "rating": 5.0,
        "price": {
            "current": 2200,
            "old": 2800,
            "currency": "см"
        },
        "city": "Хуҷанд",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s",
        "bio": "Кардиолог, мутахассиси дил ва рагҳои хунгард. Бо 12 соли таҷриба, дар ташхис ва муолиҷаи гипертония муваффақ аст.",
        "workingSchedule": [
            { "day": "Панҷшанбе", "startTime": "13:00", "endTime": "18:00" },
            { "day": "Шанбе", "startTime": "09:00", "endTime": "13:00" },
            { "day": "Душанбе", "startTime": "08:00", "endTime": "17:00" }
        ],
        "comments": [
            {
                "id": 103,
                "user": { "fullName": "Мавҷуда Каримова", "image": "https://randomuser.me/api/portraits/women/3.jpg" },
                "rating": 5,
                "comment": "Дили манро бо як табассум шифо дод!",
                "date": "2025-06-25"
            }
        ],
        "email": "saidjon.ismoilov@example.com",
        "password": "ismoilov",
        "role": "doctor",
        "phone": "+992 987 654 321",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    // ── CLINIC (second) ──
    {
        "id": 5,
        "fullName": "Маркази тиббии Шифо",
        "email": "shifo@darmon.tj",
        "password": "shifo123",
        "role": "clinic",
        "phone": "+992 44 800 80 80",
        "image": "",
        "city": "Хуҷанд",
        "clinicName": "Маркази тиббии Шифо",
        "address": "ш. Хуҷанд, к. Ленин 50"
    },
    // ── PATIENTS ──
    {
        "id": 6,
        "fullName": "Зулайхо Ҷабборова",
        "email": "zulaykho@mail.tj",
        "city": "Душанбе",
        "image": "https://randomuser.me/api/portraits/women/1.jpg",
        "password": "jabbrova",
        "role": "client",
        "phone": "+992 901 234 567"
    },
    {
        "id": 7,
        "fullName": "Саттор Юсупов",
        "email": "sattor.yusupov@gmail.com",
        "city": "Бохтар",
        "image": "",
        "password": "yusupov",
        "role": "client",
        "phone": "+992 902 345 677",
        "photo": "https://randomuser.me/api/portraits/men/2.jpg"
    }
];

// ── Chat messages ──────────────────────────
export const messages: any[] = [
    {
        "id": 1,
        "senderId": 6,
        "receiverId": 3,
        "text": "Салом, духтур! Ман мехостам дар бораи натиҷаи озмоиш пурсам.",
        "timestamp": "2026-05-10T10:00:00Z",
        "isRead": true
    },
    {
        "id": 2,
        "senderId": 3,
        "receiverId": 6,
        "text": "Салом! Натиҷаҳо хуб аст, нигаронӣ нест. Давоҳоро идома диҳед.",
        "timestamp": "2026-05-10T10:05:00Z",
        "isRead": true
    }
];

export const category = [
    {
        "id": 1,
        "name": "Тибби умумӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
        "subcategories": ["Терапевт", "Духтури оилавӣ", "Духтури умумӣ"]
    },
    {
        "id": 2,
        "name": "Бемориҳои дохилӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/822/822102.png",
        "subcategories": ["Кардиолог", "Эндокринолог", "Гастроэнтеролог", "Нефролог", "Пулмонолог", "Ревматолог", "Гематолог", "Гепатолог"]
    },
    {
        "id": 3,
        "name": "Асаб ва рӯҳӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/455/455412.png",
        "subcategories": ["Невролог", "Нейрохирург", "Психиатр", "Психотерапевт", "Нарколог", "Нейропсихолог"]
    },
    {
        "id": 4,
        "name": "Ҷарроҳӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2491/2491331.png",
        "subcategories": ["Ҷарроҳи умумӣ", "Кардиохирург", "Нейрохирург", "Ҷарроҳи шикам", "Ҷарроҳи пластикӣ", "Ҷарроҳи рагҳо"]
    },
    {
        "id": 5,
        "name": "Устухон ва ҳаракат",
        "image": "https://cdn-icons-png.flaticon.com/512/2865/2865584.png",
        "subcategories": ["Травматолог", "Ортопед", "Вертебролог", "Подолог"]
    },
    {
        "id": 6,
        "name": "Кӯдакон",
        "image": "https://cdn-icons-png.flaticon.com/512/3461/3461903.png",
        "subcategories": ["Педиатр", "Неонатолог", "Ҷарроҳи кӯдакона", "Неврологи кӯдакона", "Стоматологи кӯдакона"]
    },
    {
        "id": 7,
        "name": "Саломатии занон",
        "image": "https://cdn-icons-png.flaticon.com/512/2865/2865561.png",
        "subcategories": ["Гинеколог", "Акушер-гинеколог", "Репродуктолог", "Гинеколог-эндокринолог", "Маммолог"]
    },
    {
        "id": 8,
        "name": "Саломатии мардон",
        "image": "https://cdn-icons-png.flaticon.com/512/4333/4333603.png",
        "subcategories": ["Уролог", "Андролог"]
    },
    {
        "id": 9,
        "name": "Аъзои ҳис",
        "image": "https://cdn-icons-png.flaticon.com/512/1048/1048941.png",
        "subcategories": ["Офтальмолог", "Сурдолог", "Аудиолог", "Фониатр"]
    },
    {
        "id": 10,
        "name": "ЛОР",
        "image": "https://cdn-icons-png.flaticon.com/512/3771/3771554.png",
        "subcategories": ["Отоларинголог (ЛОР)"]
    },
    {
        "id": 11,
        "name": "Дандон",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966315.png",
        "subcategories": ["Стоматолог", "Стоматолог-терапевт", "Стоматолог-ортопед", "Ҷарроҳи ҷоғ"]
    },
    {
        "id": 12,
        "name": "Пӯст ва зебоӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/3165/3165241.png",
        "subcategories": ["Дерматолог", "Дерматовенеролог", "Косметолог", "Трихолог"]
    },
    {
        "id": 13,
        "name": "Сироят ва иммунитет",
        "image": "https://cdn-icons-png.flaticon.com/512/2913/2913604.png",
        "subcategories": ["Инфексионист", "Иммунолог", "Аллерголог", "Эпидемиолог", "Паразитолог"]
    },
    {
        "id": 14,
        "name": "Ташхис",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966448.png",
        "subcategories": ["Духтури УЗИ", "Рентгенолог", "Радиолог", "Лаборант", "Эндоскопист"]
    },
    {
        "id": 15,
        "name": "Ёрии таъҷилӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966334.png",
        "subcategories": ["Анестезиолог", "Реаниматолог", "Духтури ёрии таъҷилӣ"]
    },
    {
        "id": 16,
        "name": "Барқарорсозӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/3145/3145550.png",
        "subcategories": ["Физиотерапевт", "Реабилитолог", "ЛФК", "Массажист", "Остеопат"]
    },
    {
        "id": 17,
        "name": "Онкология",
        "image": "https://cdn-icons-png.flaticon.com/512/2167/2167039.png",
        "subcategories": ["Онколог", "Онкоҷарроҳ", "Радиотерапевт", "Фтизиатр"]
    },
    {
        "id": 18,
        "name": "Ғизо ва варзиш",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966510.png",
        "subcategories": ["Диетолог", "Духтури варзишӣ"]
    },
    {
        "id": 19,
        "name": "Соҳаҳои махсус",
        "image": "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
        "subcategories": ["Генетик", "Фармакологи клиникӣ", "Судмедэксперт"]
    }
];
