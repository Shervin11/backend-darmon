export declare const appointments: ({
    id: number;
    doctorId: number;
    clientId: number;
    date: string;
    time: string;
    status: string;
    symptoms: string;
    rejectReason: string;
    createdAt: string;
    doctorName?: undefined;
    clientName?: undefined;
    specialty?: undefined;
} | {
    doctorId: number;
    clientId: number;
    doctorName: string;
    clientName: string;
    specialty: string;
    date: string;
    time: string;
    symptoms: string;
    status: string;
    id: number;
    rejectReason?: undefined;
    createdAt?: undefined;
} | {
    doctorId: number;
    clientId: number;
    doctorName: string;
    clientName: string;
    specialty: string;
    date: string;
    time: string;
    symptoms: string;
    status: string;
    id: number;
    rejectReason: string;
    createdAt?: undefined;
})[];
export declare const wishlist: {
    id: number;
    userId: number;
    favorites: {
        doctorId: number;
        name: string;
        specialty: string;
        photo: string;
    }[];
}[];
export declare const users: ({
    id: number;
    fullName: string;
    specialty: string;
    experience: number;
    recommendation: number;
    rating: number;
    price: {
        current: number;
        old: number;
        currency: string;
    };
    city: string;
    clinic: string;
    image: string;
    bio: string;
    workingSchedule: {
        day: string;
        startTime: string;
        endTime: string;
    }[];
    comments: {
        id: number;
        user: {
            fullName: string;
            image: string;
        };
        rating: number;
        comment: string;
        date: string;
    }[];
    email: string;
    password: string;
    role: string;
    phone: string;
    photo?: undefined;
} | {
    id: number;
    fullName: string;
    email: string;
    city: string;
    image: string;
    password: string;
    role: string;
    phone: string;
    specialty?: undefined;
    experience?: undefined;
    recommendation?: undefined;
    rating?: undefined;
    price?: undefined;
    clinic?: undefined;
    bio?: undefined;
    workingSchedule?: undefined;
    comments?: undefined;
    photo?: undefined;
} | {
    id: number;
    fullName: string;
    email: string;
    city: string;
    image: string;
    password: string;
    role: string;
    phone: string;
    photo: string;
    specialty?: undefined;
    experience?: undefined;
    recommendation?: undefined;
    rating?: undefined;
    price?: undefined;
    clinic?: undefined;
    bio?: undefined;
    workingSchedule?: undefined;
    comments?: undefined;
})[];
export declare const category: {
    id: number;
    name: string;
    image: string;
    subcategories: string[];
}[];
