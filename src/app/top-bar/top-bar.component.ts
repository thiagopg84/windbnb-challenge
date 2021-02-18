import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {

  isNavActive: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onActivateNav(): boolean {
    return this.isNavActive = true;
  }

  onDeactivateNav(): boolean {
    return this.isNavActive = false;
  }
}
