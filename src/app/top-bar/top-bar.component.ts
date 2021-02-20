import { Component, OnInit } from '@angular/core';
import { Destination } from '../shared/models/destination.model';
import { GetAccommodationsService } from '../shared/services/get-accommodations.service';
import { map } from 'rxjs/operators'
import { Accommodation } from '../shared/models/accommodation.model';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  isNavActive: boolean = false;
  isSearching: boolean = false;
  currentSection: string = '';
  numberOfAdults: number = 0;
  numberOfChildren: number = 0;
  numberOfGuests: number = 0;
  destination: Destination = null; // a solução vai ser remover os caracteres !== letras, buscar no json, comparar com indexOf talvez e jogar numa array de resultados
  accommodations: Accommodation[] = [];

  constructor(private getAccommodations: GetAccommodationsService) { }

  ngOnInit(): void {
    this.getAccommodations.getAccommodations().pipe(map(accommodations => {
      this.accommodations = accommodations;
    })).subscribe()
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
  }
}