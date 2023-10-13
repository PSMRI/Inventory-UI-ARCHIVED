/*
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/
import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import {
  ViewMedicineDispenseDetailsComponent
} from './view-medicine-dispense-details/view-medicine-dispense-details.component';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { InventoryService } from '../../shared/service/inventory.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-view-medicine-dispense',
  templateUrl: './view-medicine-dispense.component.html',
  styleUrls: ['./view-medicine-dispense.component.css']
})
export class ViewMedicineDispenseComponent implements OnInit {



  _minDate: any;
  _today: any;

  _dateRange: Date[] = [];
  _dateRangePrevious: Date[] = [];

  _dispenseList = [];
  _filteredDispenseList = [];
  blankTable = [1, 2, 3, 4, 5];
  filterTerm;
  searched: Boolean = false;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  



  constructor(
    private location: Location,
    private inventoryService: InventoryService,
    private dialog: MdDialog,
    public http_service: LanguageService,
    private router: Router,
    private dataStorageService: DataStorageService,

  ) {


  }


  ngOnInit() {
    this.setDateDefault();
    this.fetchLanguageResponse();
    this.getPastDispense();
  }



  setDateDefault() {
    this._today = new Date();
    this._minDate = new Date();
    this._dateRange[0] = this._today;
    this._dateRange[1] = this._today;
    this._minDate.setFullYear(this._today.getFullYear() - 1);
    // const date = new Date(); // Now
    // date.setDate(date.getDate() - 30);
    // this._dateRange = [date, new Date()]
    console.log(this._dateRange, 'dateRange')
  }

  getPastDispense() {
    const obj = this.getViewServiceObject();
    this.inventoryService.viewMedicineDispenseEntry(obj)
      .subscribe((res) => {
        this.searched = true;
        this.loadDispense(res);
      })

  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  getViewServiceObject() {
    let startDate: Date = new Date(this._dateRange[0]);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0)

    let endDate: Date = new Date(this._dateRange[1]);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);

    return {
      facilityID: localStorage.getItem('facilityID'),
      fromDate: new Date(startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000),
      toDate: new Date(endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000),
    }
  }

  updateDate() {
    // if (this._dateRange[0] != this._dateRangePrevious[0] || this._dateRange[1] != this._dateRangePrevious[1]) {
    this._dateRangePrevious = this._dateRange;
    // console.log(JSON.stringify(this._dateRange, null, 4), 'callservice');
    this.getPastDispense();

    // }
  }


  loadDispense(dispenseObject) {
    console.log(dispenseObject);
    // if (dispenseObject) {
    //   dispenseObject.forEach(element => {
    //     element.createdDate = moment(element.createdDate).utc().format('DD/MM/YYYY HH:mm') || 'Not Available'

    //   });
    // }
    this._dispenseList = dispenseObject;
    this._filteredDispenseList = dispenseObject;
    this.filterTerm = '';
  }




  filterConsumptionList(searchTerm: string) {
    if (!searchTerm)
      this._filteredDispenseList = this._dispenseList;
    else {
      this._filteredDispenseList = [];
      this._dispenseList.forEach((item) => {
        for (let key in item) {
          if (key == 'patientIssueID' || key == 'patientName' || key == 'reference' || key == 'issueType' || key == 'createdBy') {
            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this._filteredDispenseList.push(item); break;
            }
          }
        }
      });
    }
  }


  loadDispenseDetails(dispense) {
    if (dispense && dispense.patientIssueID) {
      this.inventoryService.getParticularMedicineDispenseEntry(dispense.patientIssueID)
        .subscribe(res => this.popOutDispense(dispense, res))
    }
  }

  popOutDispense(dispense, dispenseResponse) {
    if (dispenseResponse) {
      const mdDialogRef:
        MdDialogRef<ViewMedicineDispenseDetailsComponent>
        = this.dialog.open(ViewMedicineDispenseDetailsComponent, {
          // height: '90%',
          width: '80%',
          panelClass: 'fit-screen',
          data: { dispense: dispense, dispenseItem: dispenseResponse },
          disableClose: false
        });
      mdDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dataStorageService.previousVisitData = result
          let uRL = 'previousVisitData'
          this.router.navigate(['/inventory/dynamicPrint/', uRL])
        }
      })
    }

  }
  goBack() {
    this.location.back();
  }

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}

