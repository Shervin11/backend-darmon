import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getCategories(): {
        id: number;
        name: string;
        image: string;
        subcategories: string[];
    }[];
    getUsers(): ({
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
    getUserById(id: string): {
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
    };
    updateUser(id: string, updateData: any): {
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
    };
    register(userData: any): {
        token: any;
        user: any;
    };
    login(credentials: any): {
        token: string;
        user: {
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
        };
    };
    authMe(authHeader: string): {
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
    };
    getWishlist(userId?: string): {
        id: number;
        userId: number;
        favorites: {
            doctorId: number;
            name: string;
            specialty: string;
            photo: string;
        }[];
    }[];
    createWishlist(data: any): any;
    updateWishlist(id: string, updateData: any): {
        id: number;
        userId: number;
        favorites: {
            doctorId: number;
            name: string;
            specialty: string;
            photo: string;
        }[];
    };
    getAppointments(clientId?: string, doctorId?: string, date?: string, status?: string): ({
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
    getAppointmentById(id: string): {
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
    };
    createAppointment(data: any): any;
    updateAppointment(id: string, updateData: any): {
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
    };
    uploadFile(file: any): {
        url: string;
    };
}
