"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.category = exports.users = exports.wishlist = exports.appointments = void 0;
exports.appointments = [
    {
        "id": 1,
        "doctorId": 2,
        "clientId": 12,
        "date": "2026-04-02",
        "time": "14:00",
        "status": "approved",
        "symptoms": "Дили ман тез мезанад",
        "rejectReason": "",
        "createdAt": "2026-03-25T11:30:00Z"
    },
    {
        "id": 3,
        "doctorId": 1,
        "clientId": 13,
        "date": "2026-03-28",
        "time": "11:00",
        "status": "approved",
        "symptoms": "Сулфаи сахт",
        "rejectReason": "фыв",
        "createdAt": "2026-03-24T09:00:00Z"
    },
    {
        "doctorId": 1,
        "clientId": 12,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саттор Юсупов",
        "specialty": "Терапевт",
        "date": "2026-03-31",
        "time": "11:30",
        "symptoms": "сардард",
        "status": "approved",
        "id": 2
    },
    {
        "doctorId": 2,
        "clientId": 3,
        "doctorName": "Фаррух Саидзода",
        "clientName": "Зулайхо Ҷабборова",
        "specialty": "Кардиолог",
        "date": "2026-03-28",
        "time": "16:16",
        "symptoms": "сардард",
        "status": "approved",
        "id": 4
    },
    {
        "doctorId": 2,
        "clientId": 5,
        "doctorName": "Фаррух Саидзода",
        "clientName": "Саид Махмудов",
        "specialty": "Кардиолог",
        "date": "2026-03-31",
        "time": "20:36",
        "symptoms": "r",
        "status": "rejected",
        "id": 5,
        "rejectReason": "дер шид"
    },
    {
        "doctorId": 1,
        "clientId": 5,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саид Махмудов",
        "specialty": "Терапевт",
        "date": "2026-03-30",
        "time": "11:56",
        "symptoms": "tg",
        "status": "approved",
        "id": 6
    },
    {
        "doctorId": 1,
        "clientId": 4,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саттор Юсупов",
        "specialty": "Терапевт",
        "date": "2026-04-23",
        "time": "12:30",
        "symptoms": "",
        "status": "approved",
        "id": 7
    },
    {
        "doctorId": 1,
        "clientId": 5,
        "doctorName": "Дилафрӯз Раҳимова",
        "clientName": "Саид Махмудов",
        "specialty": "Терапевт",
        "date": "2026-04-26",
        "time": "12:30",
        "symptoms": "",
        "status": "approved",
        "id": 8
    }
];
exports.wishlist = [
    {
        "id": 1,
        "userId": 11,
        "favorites": [
            {
                "doctorId": 1,
                "name": "Дилафрӯз Раҳимова",
                "specialty": "Терапевт",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            },
            {
                "doctorId": 3,
                "name": "Доктор #3",
                "specialty": "Уролог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            },
            {
                "doctorId": 5,
                "name": "Доктор #5",
                "specialty": "ЛОР (отоларинголог)",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            }
        ]
    },
    {
        "id": 2,
        "userId": 12,
        "favorites": [
            {
                "doctorId": 2,
                "name": "Фаррух Саидзода",
                "specialty": "Кардиолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s"
            }
        ]
    },
    {
        "id": 3,
        "userId": 13,
        "favorites": [
            {
                "doctorId": 1,
                "name": "Дилафрӯз Раҳимова",
                "specialty": "Терапевт",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            },
            {
                "doctorId": 2,
                "name": "Фаррух Саидзода",
                "specialty": "Кардиолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s"
            },
            {
                "doctorId": 6,
                "name": "Доктор #6",
                "specialty": "Педиатр",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            }
        ]
    },
    {
        "id": 4,
        "userId": 14,
        "favorites": [
            {
                "doctorId": 3,
                "name": "Доктор #3",
                "specialty": "Уролог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            },
            {
                "doctorId": 7,
                "name": "Доктор #7",
                "specialty": "Дерматолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s"
            }
        ]
    },
    {
        "userId": 3,
        "favorites": [
            {
                "doctorId": 2,
                "name": "Фаррух Саидзода",
                "specialty": "Кардиолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s"
            }
        ],
        "id": 5
    },
    {
        "userId": 5,
        "favorites": [
            {
                "doctorId": 2,
                "name": "Фаррух Саидзода",
                "specialty": "Кардиолог",
                "photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s"
            }
        ],
        "id": 6
    }
];
exports.users = [
    {
        "id": 1,
        "fullName": "Дилафрӯз Раҳимова",
        "specialty": "Терапевт",
        "experience": 8,
        "recommendation": 87,
        "rating": 3.7,
        "price": {
            "current": 2000,
            "old": 2500,
            "currency": "см"
        },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPMHxGKk1s41YOdM3QoXjlBGgK5TORd7v5g&s",
        "bio": "Табиби таҷрибадор барои муолиҷаи бемориҳои нафас ва умумӣ. Ӯ дорои 8 соли таҷриба буда, бо диққат ва муносибати гарм ба беморон муносибат мекунад.",
        "workingSchedule": [
            {
                "day": "Душанбе",
                "startTime": "09:00",
                "endTime": "15:00"
            },
            {
                "day": "Сешанбе",
                "startTime": "11:00",
                "endTime": "17:00"
            },
            {
                "day": "Ҷумъа",
                "startTime": "09:00",
                "endTime": "14:00"
            }
        ],
        "comments": [
            {
                "id": 101,
                "user": {
                    "fullName": "Зулайхо Ҷабборова",
                    "image": "https://randomuser.me/api/portraits/women/1.jpg"
                },
                "rating": 5,
                "comment": "Духтур хеле меҳрубон ва мутахассис аст. Ташаккур!",
                "date": "2025-06-27"
            },
            {
                "id": 1774458777468,
                "user": {
                    "fullName": "Саттор Юсупов",
                    "image": ""
                },
                "rating": 4,
                "comment": "хеле хуб",
                "date": "25.03.2026"
            }
        ],
        "email": "dilafruz.rahimova@example.com",
        "password": "rahimova",
        "role": "doctor",
        "phone": "+992 123 456 789"
    },
    {
        "id": 2,
        "fullName": "Фаррух Саидзода",
        "specialty": "Кардиолог",
        "experience": 12,
        "recommendation": 37,
        "rating": 2.9,
        "price": {
            "current": 2200,
            "old": 2800,
            "currency": "см"
        },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyqOV2N4n8cKNDfGANT7QnwHWjrf-HCgXZcg&s",
        "bio": "Кардиолог, мутахассиси дил ва рагҳои хунгард. Бо 12 соли таҷриба, дар ташхис ва муолиҷаи гипертония муваффақ аст.",
        "workingSchedule": [
            {
                "day": "Панҷшанбе",
                "startTime": "13:00",
                "endTime": "18:00"
            },
            {
                "day": "Шанбе",
                "startTime": "09:00",
                "endTime": "13:00"
            },
            {
                "day": "Душанбе",
                "startTime": "08:00",
                "endTime": "17:00"
            }
        ],
        "comments": [
            {
                "id": 103,
                "user": {
                    "fullName": "Мавҷуда Каримова",
                    "image": "https://randomuser.me/api/portraits/women/3.jpg"
                },
                "rating": 5,
                "comment": "Дили манро бо як табассум шифо дод!",
                "date": "2025-06-25"
            },
            {
                "id": 1774513698602,
                "user": {
                    "fullName": "Саид Махмудов",
                    "image": ""
                },
                "rating": 5,
                "comment": "behtarin\n",
                "date": "26.03.2026"
            }
        ],
        "email": "saidjon.ismoilov@example.com",
        "password": "ismoilov",
        "role": "doctor",
        "phone": "+992 987 654 321"
    },
    {
        "id": 3,
        "fullName": "Зулайхо Ҷабборова",
        "email": "zulaykho@mail.tj",
        "city": "Душанбе",
        "image": "https://randomuser.me/api/portraits/women/1.jpg",
        "password": "jabbrova",
        "role": "client",
        "phone": "+992 901 234 567"
    },
    {
        "id": 4,
        "fullName": "Саттор Юсупов",
        "email": "sattor.yusupov@gmail.com",
        "city": "Бохтар",
        "image": "",
        "password": "yusupov",
        "role": "client",
        "phone": "+992 902 345 677",
        "photo": "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        "fullName": "Саид Махмудов",
        "phone": "924009009",
        "email": "example@gmail.com",
        "city": "",
        "password": "123456",
        "role": "client",
        "id": 5,
        "image": ""
    }
];
exports.category = [
    {
        "id": 1,
        "name": "Тибби умумӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
        "subcategories": [
            "Терапевт",
            "Духтури оилавӣ",
            "Духтури умумӣ"
        ]
    },
    {
        "id": 2,
        "name": "Бемориҳои дохилӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/822/822102.png",
        "subcategories": [
            "Кардиолог",
            "Эндокринолог",
            "Гастроэнтеролог",
            "Нефролог",
            "Пулмонолог",
            "Ревматолог",
            "Гематолог",
            "Гепатолог"
        ]
    },
    {
        "id": 3,
        "name": "Асаб ва рӯҳӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/455/455412.png",
        "subcategories": [
            "Невролог",
            "Нейрохирург",
            "Психиатр",
            "Психотерапевт",
            "Нарколог",
            "Нейропсихолог"
        ]
    },
    {
        "id": 4,
        "name": "Ҷарроҳӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2491/2491331.png",
        "subcategories": [
            "Ҷарроҳи умумӣ",
            "Кардиохирург",
            "Нейрохирург",
            "Ҷарроҳи шикам",
            "Ҷарроҳи пластикӣ",
            "Ҷарроҳи рагҳо"
        ]
    },
    {
        "id": 5,
        "name": "Устухон ва ҳаракат",
        "image": "https://cdn-icons-png.flaticon.com/512/2865/2865584.png",
        "subcategories": [
            "Травматолог",
            "Ортопед",
            "Вертебролог",
            "Подолог"
        ]
    },
    {
        "id": 6,
        "name": "Кӯдакон",
        "image": "https://cdn-icons-png.flaticon.com/512/3461/3461903.png",
        "subcategories": [
            "Педиатр",
            "Неонатолог",
            "Ҷарроҳи кӯдакона",
            "Неврологи кӯдакона",
            "Стоматологи кӯдакона"
        ]
    },
    {
        "id": 7,
        "name": "Саломатии занон",
        "image": "https://cdn-icons-png.flaticon.com/512/2865/2865561.png",
        "subcategories": [
            "Гинеколог",
            "Акушер-гинеколог",
            "Репродуктолог",
            "Гинеколог-эндокринолог",
            "Маммолог"
        ]
    },
    {
        "id": 8,
        "name": "Саломатии мардон",
        "image": "https://cdn-icons-png.flaticon.com/512/4333/4333603.png",
        "subcategories": [
            "Уролог",
            "Андролог"
        ]
    },
    {
        "id": 9,
        "name": "Аъзои ҳис",
        "image": "https://cdn-icons-png.flaticon.com/512/1048/1048941.png",
        "subcategories": [
            "Офтальмолог",
            "Сурдолог",
            "Аудиолог",
            "Фониатр"
        ]
    },
    {
        "id": 10,
        "name": "ЛОР",
        "image": "https://cdn-icons-png.flaticon.com/512/3771/3771554.png",
        "subcategories": [
            "Отоларинголог (ЛОР)"
        ]
    },
    {
        "id": 11,
        "name": "Дандон",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966315.png",
        "subcategories": [
            "Стоматолог",
            "Стоматолог-терапевт",
            "Стоматолог-ортопед",
            "Ҷарроҳи ҷоғ"
        ]
    },
    {
        "id": 12,
        "name": "Пӯст ва зебоӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/3165/3165241.png",
        "subcategories": [
            "Дерматолог",
            "Дерматовенеролог",
            "Косметолог",
            "Трихолог"
        ]
    },
    {
        "id": 13,
        "name": "Сироят ва иммунитет",
        "image": "https://cdn-icons-png.flaticon.com/512/2913/2913604.png",
        "subcategories": [
            "Инфексионист",
            "Иммунолог",
            "Аллерголог",
            "Эпидемиолог",
            "Паразитолог"
        ]
    },
    {
        "id": 14,
        "name": "Ташхис",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966448.png",
        "subcategories": [
            "Духтури УЗИ",
            "Рентгенолог",
            "Радиолог",
            "Лаборант",
            "Эндоскопист"
        ]
    },
    {
        "id": 15,
        "name": "Ёрии таъҷилӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966334.png",
        "subcategories": [
            "Анестезиолог",
            "Реаниматолог",
            "Духтури ёрии таъҷилӣ"
        ]
    },
    {
        "id": 16,
        "name": "Барқарорсозӣ",
        "image": "https://cdn-icons-png.flaticon.com/512/3145/3145550.png",
        "subcategories": [
            "Физиотерапевт",
            "Реабилитолог",
            "ЛФК",
            "Массажист",
            "Остеопат"
        ]
    },
    {
        "id": 17,
        "name": "Онкология",
        "image": "https://cdn-icons-png.flaticon.com/512/2167/2167039.png",
        "subcategories": [
            "Онколог",
            "Онкоҷарроҳ",
            "Радиотерапевт",
            "Фтизиатр"
        ]
    },
    {
        "id": 18,
        "name": "Ғизо ва варзиш",
        "image": "https://cdn-icons-png.flaticon.com/512/2966/2966510.png",
        "subcategories": [
            "Диетолог",
            "Духтури варзишӣ"
        ]
    },
    {
        "id": 19,
        "name": "Соҳаҳои махсус",
        "image": "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
        "subcategories": [
            "Генетик",
            "Фармакологи клиникӣ",
            "Судмедэксперт"
        ]
    }
];
//# sourceMappingURL=data.js.map