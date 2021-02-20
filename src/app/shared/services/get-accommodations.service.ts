import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Accommodation } from '../models/accommodation.model';

@Injectable({
  providedIn: 'root'
})
export class GetAccommodationsService {

  constructor(private http: HttpClient) { }

  getAccommodations() {
    return this.http.get<Accommodation[]>('../../../assets/accommodations/accommodation-data.json')
  }
}
