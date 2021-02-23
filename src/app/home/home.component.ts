import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Accommodation } from '../shared/models/accommodation.model';
import { Destination } from '../shared/models/destination.model';
import { SearchResultsService } from '../shared/services/search-results.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  accommodations: Accommodation[] = [];
  destination: Destination;
  isSearching: boolean;

  constructor(private searchResults: SearchResultsService) { }

  ngOnInit(): void {
    this.searchResults.searchResults
      .pipe(
        map(accommodations => {
          this.accommodations = accommodations;
        })
    ).subscribe();

    this.searchResults.isSearching
      .pipe(
        map(isSearching => {
          this.isSearching = isSearching;
        })
    ).subscribe();
  }
  pullSearchData(event) {
    this.destination = event;
  }
}
