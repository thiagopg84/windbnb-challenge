export class Accommodation {
    constructor(
        public isSuperHost: boolean,
        public roomType: string,
        public rating: number,
        public shortDescription: string,
        public photos: string[],
        public maxGuests: number,
        public city: string,
        public country: string
    ) {}
}