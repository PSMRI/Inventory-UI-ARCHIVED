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
import { Component, OnInit } from '@angular/core';
import { MdDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DataStorageService } from '../../shared/service/data-storage.service';
import { InventoryService } from '../../shared/service/inventory.service';
import { Location } from '@angular/common';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-patient-return-previous-record',
  templateUrl: './patient-return-previous-record.component.html',
  styleUrls: ['./patient-return-previous-record.component.css']
})
export class PatientReturnPreviousRecordComponent implements OnInit {

  today:any;
  fromDate: any;
  toDate: any;
  patientReturnList = [];

  filterTerm: any;
  filteredPatientReturnList = [];
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private location: Location,
    private dialog: MdDialog,
    private router: Router,
    private http_service: LanguageService,
    private dataStorageService: DataStorageService,
    private inventoryService: InventoryService) { }

  ngOnInit() {
    this.initializeDate();
    this.fetchLanguageResponse();
  }


  initializeDate() {
    this.fromDate = new Date();
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate = new Date();

    this.fromDate.setHours(0);
    this.fromDate.setMinutes(0);
    this.fromDate.setSeconds(0);
    this.fromDate.setMilliseconds(0);

    this.toDate.setHours(23);
    this.toDate.setMinutes(59);
    this.toDate.setSeconds(59);
    this.toDate.setMilliseconds(0);

    this.today = new Date();
    this.viewRecords();
  }

  viewRecords() {
    let startDate: Date = new Date(this.fromDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0)

    let endDate: Date = new Date(this.toDate);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);

    let temp = {
      fromDate: new Date(startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000),
      toDate: new Date(endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000),
      "facilityID":  localStorage.getItem('facilityID') ? +(localStorage.getItem('facilityID')) : undefined
    };

    this.inventoryService.getPatientReturnList(temp)
      .subscribe(response => {
        console.log('res..',response);
        this.patientReturnList = response.data.slice();
        console.log('patientReturnList', this.patientReturnList);
        this.filteredPatientReturnList = response.data.slice();
        console.log('filteredPatientReturnList', this.filteredPatientReturnList);
        
      })
  }

  goBack() {
    this.location.back();
  }

  filterPatientReturnList(filterTerm) {
    if (!filterTerm)
      this.filteredPatientReturnList = this.patientReturnList.slice();
    else {
      this.filteredPatientReturnList = [];
      this.patientReturnList.forEach((item) => {
        for (let key in item) {
          if (key == 'itemName' || key == 'batchNo' || key == 'dateofIssue' || key == 'patientName' || key == 'returnDate') {
            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredPatientReturnList.push(item); break;
            }
          }
        }
      });
    }
  }

  //AN40085822 29/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}
