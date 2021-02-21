import { Component, OnInit } from '@angular/core';
import { Destination } from '../shared/models/destination.model';
import { GetAccommodationsService } from '../shared/services/get-accommodations.service';
import { debounceTime, filter, map } from 'rxjs/operators'
import { Accommodation } from '../shared/models/accommodation.model';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

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
    destinationName: [null, Validators.required]
  })

  constructor(private getAccommodations: GetAccommodationsService, private form: FormBuilder) { }

  ngOnInit(): void {
    // this.getAccommodations.getAccommodations().pipe(map(accommodations => {
    //   this.accommodations = accommodations;
    // })).subscribe()

    this.searchSubscription = this.searchQuery
      .pipe(
        map(query => {
          this.isSearching = true;
          this.destination = null;
          this.destinations = [];
          this.filteredDestinations = [];
          return query;
        }),
        debounceTime(250),
        filter(res => res.length > 2)
      ).subscribe(query => {
        this.destination = null;
        this.destinations = [];
        this.filteredDestinations = [];
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
                if (!this.destinations.some(e => e.city === accommodations[accommodation].city)) {
                  this.destinations.push(new Destination(accommodations[accommodation].city, accommodations[accommodation].country));
                }
              }
              
              this.filteredDestinations = this.destinations.filter(item => {
                let city: string = item.city.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                let country: string = item.country.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                return formattedQuery.includes(city) && formattedQuery.includes(country);
                // if (this.longestCommonSubstring([city, formattedQuery]) && this.longestCommonSubstring([country, formattedQuery])) {
                //   return (this.longestCommonSubstring([city, formattedQuery]) && this.longestCommonSubstring([country, formattedQuery]))
                // }
              })

              if (this.filteredDestinations.length === 0) {
                this.destinations.forEach(e => {
                  let city: string = e.city.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                  let country: string = e.country.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').replace(/[^A-Z\d\s]/gi, '').replace(/\s+/g, ' ');
                  if (formattedQuery.includes(city) && !formattedQuery.includes(country)) {
                    this.filteredDestinations.push(new Destination(e.city, e.country));
                  } else if (formattedQuery.includes(country) && !formattedQuery.includes(city)) {
                    this.filteredDestinations.push(new Destination(e.city, e.country));
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
  }

  decreaseAdults() {
    if (this.numberOfAdults > 0) {
      this.numberOfAdults--;
      this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
    }
  }

  increaseChildren() {
    this.numberOfChildren++;
    this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
  }

  decreaseChildren() {
    if (this.numberOfChildren > 0) {
      this.numberOfChildren--;
      this.numberOfGuests = this.numberOfAdults + this.numberOfChildren;
    }
  }

  defineDestination(city: string, country: string) {
    this.destination = new Destination(city, country);
    this.filteredDestinations = [];
  }

  onSearchDestinations() {
    this.searchQuery.next(this.searchForm.value.destinationName);
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

  onSubmitSearchForm() {
    console.log('submitou')
  }
}