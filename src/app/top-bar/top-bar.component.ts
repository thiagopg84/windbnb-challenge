import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Destination } from '../shared/models/destination.model';
import { GetAccommodationsService } from '../shared/services/get-accommodations.service';
import { debounceTime, filter, map, } from 'rxjs/operators'
import { Accommodation } from '../shared/models/accommodation.model';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { SearchResultsService } from '../shared/services/search-results.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  @Output() destinationData = new EventEmitter<Destination>();

  isNavActive: boolean = false;
  currentSection: string = '';
  numberOfAdults: number = 0;
  numberOfChildren: number = 0;
  numberOfGuests: number = 0;
  destination: Destination = null;
  accommodations: Accommodation[] = [];

  // search function
  isSearching: boolean = false;
  query: string = null;
  searchSubscription: Subscription;
  fetchDb: Subscription;
  searchQuery: Subject<string> = new Subject<string>();
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];

  // form
  searchForm = this.form.group({
    destinationCity: [null, Validators.required],
    destinationCountry: [null, Validators.required],
    guestsNumber: [null, Validators.required]
  })

  constructor(private getAccommodations: GetAccommodationsService, private form: FormBuilder, private searchResults: SearchResultsService) { }

  ngOnInit(): void {
    // this.getAccommodations.getAccommodations().pipe(map(accommodations => {
    //   this.accommodations = accommodations;
    // })).subscribe()

    this.searchResults.searchResults.subscribe(data => {
      // console.log(data);
    })

    this.searchSubscription = this.searchQuery
      .pipe(
        map(query => {
          this.isSearching = true;
          this.destination = null;
          this.destinations = [];
          this.filteredDestinations = [];
          this.searchForm.patchValue({
            destinationCountry: null
          })
          return query;
        }),
        debounceTime(250),
        filter(res => res.length > 2)
      ).subscribe(query => {
        this.destination = null;
        this.destinations = [];
        this.filteredDestinations = [];
        this.searchForm.patchValue({
          destinationCountry: null
        })
        this.fetchDb = this.getAccommodations.getAccommodations()
          .pipe(
            map(accommodations => {
              const formattedQuery: string = query.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
              for (let accommodation in accommodations) {
                    // if (formattedQuery.includes(city) && formattedQuery.includes(country)) {
                //   console.log('1')
                //   if (!this.destinations.some(e => e.city === accommodations[accommodation].city)) {
                //     this.destinations.push(new Destination(accommodations[accommodation].city, accommodations[accommodation].country));
                //   }
                // } else if (formattedQuery.includes(city)) {
                //   console.log('2')
                //   if (!this.destinations.some(e => e.city === accommodations[accommodation].city)) {
                //     this.destinations.push(new Destination(accommodations[accommodation].city, accommodations[accommodation].country));
                //   }
                // } else if (formattedQuery.includes(country)) {
                //   console.log('3')
                //   if (!formattedQuery.includes(city)) {
                //     if (!this.destinations.some(e => e.city === accommodations[accommodation].city)) {
                //       this.destinations.push(new Destination(accommodations[accommodation].city, accommodations[accommodation].country));
                //     }
                //   }
                // }
                
                if (!this.destinations.some(e => e.city === accommodations[accommodation].city)) { // checking if the array of destinations already has the current city
                  this.destinations.push(new Destination(accommodations[accommodation].city, accommodations[accommodation].country));
                }
              }
              
              this.filteredDestinations = this.destinations.filter(item => { // checking if there is a perfect match in 'destinations' array (city and country)
                let city: string = item.city.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                let country: string = item.country.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                return formattedQuery.includes(city) && formattedQuery.includes(country)                
              })
              
              if (this.filteredDestinations.length === 0) { // if there's no perfect match...
              this.destinations.forEach(e => {
                let city: string = e.city.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                let country: string = e.country.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');

                if (formattedQuery.includes(city) && !formattedQuery.includes(country)) { // if there's a perfect match for 'city'...
                  this.filteredDestinations.push(new Destination(e.city, e.country));
                } else if (formattedQuery.includes(country) && !formattedQuery.includes(city)) { // if there's a perfect match for 'country'...
                  this.filteredDestinations.push(new Destination(e.city, e.country));
                } else if (!formattedQuery.includes(city) && !formattedQuery.includes(country)) {  // if there isn't a perfect match, use algorithm...
                  if (this.similarity(formattedQuery, city) > .5 || this.similarity(formattedQuery, country) > .5) {
                    this.filteredDestinations.push(new Destination(e.city, e.country));
                  }
                }
              })
            }
          })
        ).subscribe(() => {
          this.isSearching = false;
        })
      })
  }

  onActivateNav(section: string): boolean {
    this.currentSection = section;
    return this.isNavActive = true;
  }

  onDeactivateNav(): boolean {
    return this.isNavActive = false;
  }

  increaseAdults() {
    this.numberOfAdults++;
    this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
    if (this.numberOfGuests > 0) {
      this.searchForm.patchValue({
        guestsNumber: this.numberOfGuests
      })
    } else {
      this.searchForm.patchValue({
        guestsNumber: null
      })
    }
  }

  decreaseAdults() {
    if (this.numberOfAdults > 0) {
      this.numberOfAdults--;
      this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
      if (this.numberOfGuests > 0) {
        this.searchForm.patchValue({
          guestsNumber: this.numberOfGuests
        })
      } else {
        this.searchForm.patchValue({
          guestsNumber: null
        })
      }
    }
  }

  increaseChildren() {
    this.numberOfChildren++;
    this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
    if (this.numberOfGuests > 0) {
      this.searchForm.patchValue({
        guestsNumber: this.numberOfGuests
      })
    } else {
      this.searchForm.patchValue({
        guestsNumber: null
      })
    }
  }

  decreaseChildren() {
    if (this.numberOfChildren > 0) {
      this.numberOfChildren--;
      this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
      if (this.numberOfGuests > 0) {
        this.searchForm.patchValue({
          guestsNumber: this.numberOfGuests
        })
      } else {
        this.searchForm.patchValue({
          guestsNumber: null
        })
      }
    }
  }

  defineDestination(city: string, country: string) {
    this.destination = new Destination(city, country);
    this.filteredDestinations = [];
    this.searchForm.patchValue({
      destinationCity: city,
      destinationCountry: country
    })
  }

  onSearchDestinations() {
    this.searchQuery.next(this.searchForm.value.destinationCity);
  }

  // longestCommonSubstring(strArr: string[]) {
  //   const sortedArray = [...strArr].sort();
  //   const firstItem = sortedArray[0];
  //   const lastItem = sortedArray[sortedArray.length - 1];
  //   const firstItemLength = firstItem.length;
  //   let i = 0;
  
  //   while (i < firstItemLength && firstItem.charAt(i) === lastItem.charAt(i)) {
  //     i++;
  //   } 
    
  //   if (firstItem.substring(0, i).length > 3) {
  //     return firstItem.substring(0, i)
  //   }
  // }

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  onSubmitSearchForm() {
    // console.log(this.searchForm.getRawValue())
    this.getAccommodations.getAccommodations()
      .pipe(
        map(accommodations => {
          this.searchResults.isSearching.next(true)
          this.accommodations = [];
          for (let accommodation in accommodations) {
            let currentAccomodation: Accommodation = new Accommodation(null, null, null, null, [], null, null, null);
            currentAccomodation.isSuperHost = accommodations[accommodation].isSuperHost;
            currentAccomodation.roomType = accommodations[accommodation].roomType;
            currentAccomodation.rating = accommodations[accommodation].rating;
            currentAccomodation.shortDescription = accommodations[accommodation].shortDescription;
            currentAccomodation.maxGuests = accommodations[accommodation].maxGuests;
            currentAccomodation.city = accommodations[accommodation].city;
            currentAccomodation.country = accommodations[accommodation].country;
            for (let photo in accommodations[accommodation].photos) {
              currentAccomodation.photos.push(accommodations[accommodation].photos[photo])
            }
            this.accommodations.push(currentAccomodation);
          }
          return this.accommodations;
        })
      ).subscribe(accommodations => {
        this.destinationData.emit(this.destination)
        this.searchResults.searchResults.next(accommodations.filter(accommodation => {
          return accommodation.city === this.searchForm.value.destinationCity && accommodation.country === this.searchForm.value.destinationCountry && accommodation.maxGuests >= this.searchForm.value.guestsNumber;
      }));
        this.searchForm.reset();
        this.searchResults.isSearching.next(false);
      })
    this.isNavActive = false;
    this.numberOfAdults = 0;
    this.numberOfChildren = 0;
    this.numberOfGuests = 0;
  }
}