import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Accommodation } from '../models/accommodation.model';

@Injectable({
  providedIn: 'root'
})
export class SearchResultsService {
  
  searchResults: Subject<Accommodation[]> = new Subject<Accommodation[]>();
  isSearching: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor() { }
}
