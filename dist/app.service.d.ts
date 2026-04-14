export declare class AppService {
    private appointments;
    private wishlist;
    private users;
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
    getUserById(id: string | number): {
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
    updateUser(id: string | number, updateData: any): {
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
    authMe(token: string): {
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
    getWishlist(userId?: string | number): {
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
    updateWishlist(id: string | number, updateData: any): {
        id: number;
        userId: number;
        favorites: {
            doctorId: number;
            name: string;
            specialty: string;
            photo: string;
        }[];
    };
    getAppointments(clientId?: string | number, doctorId?: string | number, date?: string, status?: string): ({
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
    createAppointment(data: any): any;
    updateAppointment(id: string | number, updateData: any): {
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
    getAppointmentById(id: string | number): {
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
}
