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
    },
    // ── MORE DOCTORS ──
    {
        "id": 8,
        "fullName": "Нигина Ашурова",
        "specialty": "Невролог",
        "experience": 10,
        "recommendation": 95,
        "rating": 4.8,
        "price": { "current": 1800, "old": 2200, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/women/44.jpg",
        "bio": "Мутахассиси асаб бо 10 соли таҷриба. Табобати сардард, эпилепсия ва бемориҳои системаи асаб.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "08:00", "endTime": "14:00" },
            { "day": "Чоршанбе", "startTime": "09:00", "endTime": "15:00" }
        ],
        "comments": [],
        "email": "nigina.ashurova@example.com",
        "password": "ashurova",
        "role": "doctor",
        "phone": "+992 900 111 222",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 9,
        "fullName": "Рустам Ҳасанов",
        "specialty": "Ҷарроҳи умумӣ",
        "experience": 15,
        "recommendation": 98,
        "rating": 4.9,
        "price": { "current": 3000, "old": 3500, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/32.jpg",
        "bio": "Ҷарроҳи генерал бо 15 соли таҷриба дар амалиётҳои шикамӣ ва лапароскопия.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "08:00", "endTime": "16:00" },
            { "day": "Панҷшанбе", "startTime": "08:00", "endTime": "16:00" }
        ],
        "comments": [],
        "email": "rustam.hasanov@example.com",
        "password": "hasanov",
        "role": "doctor",
        "phone": "+992 900 222 333",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 10,
        "fullName": "Малика Раҷабова",
        "specialty": "Педиатр",
        "experience": 7,
        "recommendation": 92,
        "rating": 4.7,
        "price": { "current": 1500, "old": 1800, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/68.jpg",
        "bio": "Духтури кӯдакон бо нигоҳи махсус ба саломатии навзодон ва кӯдакони хурдсол.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "09:00", "endTime": "15:00" },
            { "day": "Ҷумъа", "startTime": "09:00", "endTime": "13:00" }
        ],
        "comments": [],
        "email": "malika.rajabova@example.com",
        "password": "rajabova",
        "role": "doctor",
        "phone": "+992 900 333 444",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 11,
        "fullName": "Фирдавс Назаров",
        "specialty": "Гинеколог",
        "experience": 12,
        "recommendation": 96,
        "rating": 4.6,
        "price": { "current": 2500, "old": 3000, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/45.jpg",
        "bio": "Акушер-гинеколог бо таҷрибаи бой дар соҳаи саломатии занон ва зоиш.",
        "workingSchedule": [
            { "day": "Чоршанбе", "startTime": "08:00", "endTime": "14:00" },
            { "day": "Шанбе", "startTime": "09:00", "endTime": "13:00" }
        ],
        "comments": [],
        "email": "firdavs.nazarov@example.com",
        "password": "nazarov",
        "role": "doctor",
        "phone": "+992 900 444 555",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 12,
        "fullName": "Шаҳноза Каримова",
        "specialty": "Дерматолог",
        "experience": 6,
        "recommendation": 88,
        "rating": 4.4,
        "price": { "current": 1600, "old": 2000, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/22.jpg",
        "bio": "Мутахассиси пӯст ва зебоӣ. Табобати бемориҳои пӯст, аллергия ва косметология.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "10:00", "endTime": "16:00" },
            { "day": "Панҷшанбе", "startTime": "10:00", "endTime": "16:00" }
        ],
        "comments": [],
        "email": "shahnoza.karimova@example.com",
        "password": "karimova",
        "role": "doctor",
        "phone": "+992 900 555 666",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 13,
        "fullName": "Баҳром Сафаров",
        "specialty": "Уролог",
        "experience": 9,
        "recommendation": 90,
        "rating": 4.5,
        "price": { "current": 2200, "old": 2600, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/55.jpg",
        "bio": "Мутахассиси урология. Ташхис ва муолиҷаи бемориҳои системаи пешоб ва саломатии мардон.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "08:00", "endTime": "15:00" },
            { "day": "Ҷумъа", "startTime": "08:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "bahrom.safarov@example.com",
        "password": "safarov",
        "role": "doctor",
        "phone": "+992 900 666 777",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 14,
        "fullName": "Зарина Ҷӯраева",
        "specialty": "Офтальмолог",
        "experience": 11,
        "recommendation": 94,
        "rating": 4.8,
        "price": { "current": 2000, "old": 2400, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/33.jpg",
        "bio": "Духтури чашм. Табобати катаракта, глаукома ва ислоҳи биноӣ бо усулҳои муосир.",
        "workingSchedule": [
            { "day": "Чоршанбе", "startTime": "09:00", "endTime": "15:00" },
            { "day": "Шанбе", "startTime": "09:00", "endTime": "12:00" }
        ],
        "comments": [],
        "email": "zarina.juraeva@example.com",
        "password": "juraeva",
        "role": "doctor",
        "phone": "+992 900 777 888",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 15,
        "fullName": "Абдулло Мирзоев",
        "specialty": "Отоларинголог (ЛОР)",
        "experience": 8,
        "recommendation": 91,
        "rating": 4.6,
        "price": { "current": 1800, "old": 2200, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/62.jpg",
        "bio": "Мутахассиси гӯш, бинӣ ва гулӯ. Табобати синусит, отит ва бемориҳои ЛОР.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "08:00", "endTime": "14:00" },
            { "day": "Панҷшанбе", "startTime": "08:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "abdullo.mirzoev@example.com",
        "password": "mirzoev",
        "role": "doctor",
        "phone": "+992 900 888 999",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 16,
        "fullName": "Мадина Шарипова",
        "specialty": "Эндокринолог",
        "experience": 10,
        "recommendation": 93,
        "rating": 4.7,
        "price": { "current": 2100, "old": 2500, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/women/55.jpg",
        "bio": "Мутахассиси ғадудҳои дарунрез. Табобати диабет, бемориҳои тиреоид ва ихтилоли ҳормонӣ.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "09:00", "endTime": "14:00" },
            { "day": "Чоршанбе", "startTime": "09:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "madina.sharipova@example.com",
        "password": "sharipova",
        "role": "doctor",
        "phone": "+992 900 111 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 17,
        "fullName": "Ислом Раҳматуллоев",
        "specialty": "Стоматолог",
        "experience": 5,
        "recommendation": 85,
        "rating": 4.3,
        "price": { "current": 1200, "old": 1500, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/men/72.jpg",
        "bio": "Стоматолог-терапевт. Муолиҷаи кариес, пулпит ва зебосозии дандон.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "09:00", "endTime": "17:00" },
            { "day": "Ҷумъа", "startTime": "09:00", "endTime": "15:00" }
        ],
        "comments": [],
        "email": "islom.rahmatulloev@example.com",
        "password": "rahmatulloev",
        "role": "doctor",
        "phone": "+992 900 222 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 18,
        "fullName": "Гулнора Давлатова",
        "specialty": "Травматолог",
        "experience": 14,
        "recommendation": 97,
        "rating": 4.9,
        "price": { "current": 2800, "old": 3200, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/women/77.jpg",
        "bio": "Травматолог-ортопед. Муолиҷаи шикастагии устухон, осебҳои варзишӣ ва барқарорсозӣ.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "08:00", "endTime": "16:00" },
            { "day": "Панҷшанбе", "startTime": "08:00", "endTime": "16:00" }
        ],
        "comments": [],
        "email": "gulnora.davlatova@example.com",
        "password": "davlatova",
        "role": "doctor",
        "phone": "+992 900 333 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 19,
        "fullName": "Ҳусейн Ализода",
        "specialty": "Онколог",
        "experience": 16,
        "recommendation": 99,
        "rating": 5.0,
        "price": { "current": 3500, "old": 4000, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/88.jpg",
        "bio": "Онколог бо 16 соли таҷриба. Ташхиси барвақт ва табобати навҳои гуногуни бадхимӣ.",
        "workingSchedule": [
            { "day": "Чоршанбе", "startTime": "08:00", "endTime": "14:00" },
            { "day": "Ҷумъа", "startTime": "08:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "husein.alizoda@example.com",
        "password": "alizoda",
        "role": "doctor",
        "phone": "+992 900 444 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 20,
        "fullName": "Фотима Ҳакимова",
        "specialty": "Гастроэнтеролог",
        "experience": 9,
        "recommendation": 90,
        "rating": 4.5,
        "price": { "current": 2000, "old": 2400, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/88.jpg",
        "bio": "Мутахассиси бемориҳои меъда ва рӯда. Ташхис ва табобати гастрит, язва, колит.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "09:00", "endTime": "15:00" },
            { "day": "Шанбе", "startTime": "09:00", "endTime": "13:00" }
        ],
        "comments": [],
        "email": "fotima.hakimova@example.com",
        "password": "hakimova",
        "role": "doctor",
        "phone": "+992 900 555 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 21,
        "fullName": "Сирочиддин Ғаниев",
        "specialty": "Психиатр",
        "experience": 11,
        "recommendation": 87,
        "rating": 4.4,
        "price": { "current": 2200, "old": 2600, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/44.jpg",
        "bio": "Психиатр-психотерапевт. Табобати афсурдагӣ, изтироб, бемориҳои хоб ва стресс.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "10:00", "endTime": "16:00" },
            { "day": "Панҷшанбе", "startTime": "10:00", "endTime": "16:00" }
        ],
        "comments": [],
        "email": "sirojiddin.ghaniev@example.com",
        "password": "ghaniev",
        "role": "doctor",
        "phone": "+992 900 666 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 22,
        "fullName": "Парвина Мирзоева",
        "specialty": "Аллерголог",
        "experience": 6,
        "recommendation": 86,
        "rating": 4.3,
        "price": { "current": 1700, "old": 2000, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/12.jpg",
        "bio": "Мутахассиси аллергия ва иммунология. Табобати аллергияи мавсимӣ, астма ва экзема.",
        "workingSchedule": [
            { "day": "Чоршанбе", "startTime": "09:00", "endTime": "14:00" },
            { "day": "Ҷумъа", "startTime": "09:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "parvina.mirzoeva@example.com",
        "password": "mirzoeva",
        "role": "doctor",
        "phone": "+992 900 777 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 23,
        "fullName": "Далер Шодиев",
        "specialty": "Физиотерапевт",
        "experience": 8,
        "recommendation": 89,
        "rating": 4.5,
        "price": { "current": 1500, "old": 1800, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/77.jpg",
        "bio": "Физиотерапевт ва реабилитолог. Барқарорсозӣ пас аз амалиёт, ЛФК ва массаж.",
        "workingSchedule": [
            { "day": "Сешанбе", "startTime": "08:00", "endTime": "15:00" },
            { "day": "Шанбе", "startTime": "08:00", "endTime": "12:00" }
        ],
        "comments": [],
        "email": "daler.shodiev@example.com",
        "password": "shodiev",
        "role": "doctor",
        "phone": "+992 900 888 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 24,
        "fullName": "Мунира Саидова",
        "specialty": "Диетолог",
        "experience": 4,
        "recommendation": 82,
        "rating": 4.2,
        "price": { "current": 1300, "old": 1600, "currency": "см" },
        "city": "Хуҷанд",
        "clinic": "Маркази тиббии Шифо",
        "clinicId": 5,
        "image": "https://randomuser.me/api/portraits/women/90.jpg",
        "bio": "Мутахассиси ғизо ва парҳез. Тартиби ғизои солим барои кам кардани вазн ва беморон.",
        "workingSchedule": [
            { "day": "Душанбе", "startTime": "10:00", "endTime": "15:00" },
            { "day": "Ҷумъа", "startTime": "10:00", "endTime": "14:00" }
        ],
        "comments": [],
        "email": "munira.saidova@example.com",
        "password": "saidova",
        "role": "doctor",
        "phone": "+992 900 999 000",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
    },
    {
        "id": 25,
        "fullName": "Комрон Файзуллоев",
        "specialty": "Духтури УЗИ",
        "experience": 7,
        "recommendation": 88,
        "rating": 4.4,
        "price": { "current": 1400, "old": 1700, "currency": "см" },
        "city": "Душанбе",
        "clinic": "Клиникаи Сино",
        "clinicId": 2,
        "image": "https://randomuser.me/api/portraits/men/22.jpg",
        "bio": "Мутахассиси ташхиси УЗИ. Тафтиши узвҳои дохилӣ, дил, рагҳо ва ғадудҳо.",
        "workingSchedule": [
            { "day": "Чоршанбе", "startTime": "08:00", "endTime": "16:00" },
            { "day": "Панҷшанбе", "startTime": "08:00", "endTime": "16:00" }
        ],
        "comments": [],
        "email": "komron.fayzulloev@example.com",
        "password": "fayzulloev",
        "role": "doctor",
        "phone": "+992 900 100 200",
        "diploma": "/diploma.jpg",
        "diplomaVerified": true
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
