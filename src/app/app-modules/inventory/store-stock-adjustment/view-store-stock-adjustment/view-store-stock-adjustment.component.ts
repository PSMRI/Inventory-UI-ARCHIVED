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
import { InventoryService } from 'app/app-modules/inventory/shared/service/inventory.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { MdDialog } from '@angular/material';
import { ViewStockAdjustmentDetailsComponent } from 'app/app-modules/inventory/store-stock-adjustment/view-stock-adjustment-details/view-stock-adjustment-details.component';
import { DataStorageService } from 'app/app-modules/inventory/shared/service/data-storage.service';

import * as moment from 'moment';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-view-store-stock-adjustment',
  templateUrl: './view-store-stock-adjustment.component.html',
  styleUrls: ['./view-store-stock-adjustment.component.css']
})
export class ViewStoreStockAdjustmentComponent implements OnInit {

  today:any;
  fromDate: any;
  toDate: any;
  stockAdjustmentList = [];
  _minDate: any;
  filterTerm: any;
  filteredStockAdjustmentList = [];
  currentLanguageSet: any;
  languageComponent: SetLanguageComponent;

  constructor(
    private location: Location,
    private dialog: MdDialog,
    private http_service: LanguageService,
    private router: Router,
    private dataStorageService: DataStorageService,
    private inventoryService: InventoryService) { }

  ngOnInit() {
    this.fromDate = new Date();
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate = new Date();

    this.today = new Date();
    this.viewRecords();
    this.fetchLanguageResponse();
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
      facilityID: localStorage.getItem('facilityID') ? +(localStorage.getItem('facilityID')) : undefined
    };

    this.inventoryService.getStockAdjustmentList(temp)
      .subscribe(response => {
        this.stockAdjustmentList = response.slice();
        this.filteredStockAdjustmentList = response.slice();
      })
  }

  filterStockAdjustmentList(filterTerm) {
    if (!filterTerm)
      this.filteredStockAdjustmentList = this.stockAdjustmentList.slice();
    else {
      this.filteredStockAdjustmentList = [];
      this.stockAdjustmentList.forEach((item) => {
        for (let key in item) {
          if (key == 'stockAdjustmentDraftID' || key == 'refNo' || key == 'reason' || key == 'createdBy') {
            let value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredStockAdjustmentList.push(item); break;
            }
          }
        }
      });
    }
  }

  viewStockAdjustmentDetails(adjustmentID) {
    this.dialog.open(ViewStockAdjustmentDetailsComponent, {
      width: "80%",
      panelClass: 'fit-screen',
      data: {
        adjustmentID: adjustmentID
      }
    }).afterClosed().subscribe(response => {
      if (response) {
        const printableData = this.createPrintableData(response);
        this.dataStorageService.adjustment = printableData;
        let URL = 'adjustment'
        this.router.navigate(['/inventory/dynamicPrint/', URL])
      }
    })
  }

  goBack() {
    this.location.back();
  }

  goToUpdateAdjustmentDraft(draftID) {
    this.router.navigate(["inventory/storeStockAdjustment/update", draftID]);
  }

  createPrintableData(adjustmentDetials) {
    let facilityDetail = JSON.parse(localStorage.getItem('facilityDetail'))
    let facilityName = facilityDetail.facilityName;
    let adjustedItemList = []
    let i = 0;
    
    adjustmentDetials.stockAdjustmentItemDraftEdit.forEach((stock) => {
      i = i + 1;
      let temp = {
        'sNo': i,
        'itemName': stock.itemName,
        'batchID': stock.batchID,
        'quantityInHand': stock.quantityInHand,
        'adjustedQuantity': stock.adjustedQuantity,
        'adjustmentType': stock.isAdded != undefined && stock.isAdded ? 'Receipt' : 'Issue',
        'reason': stock.reason
      }
      adjustedItemList.push(temp);
    });
    
    let headerDetails = Object.assign({ facilityName: facilityName, createDate: moment(adjustmentDetials.createdDate).format('DD-MM-YYYY') }, adjustmentDetials);
    let printableData = Object.assign({}, { title: this.title }, { headerColumn: this.headerColumn }, { headerDetail: headerDetails }, { columns: this.columns }, { printableData: adjustedItemList });
    return printableData;
  }

  setDateDefault() {
    this.today = new Date();
    this._minDate = new Date();
    this._minDate.setFullYear(this.today.getFullYear() - 1);
  }

  title = {
    modalTitle: '',
    headerTitle: 'Adjustment Detail',
    tableTitle: ''
  }

  columns = [
    {
      "keyName": "sNo",
      "columnName": "S No."
    },
    {
      "keyName": "itemName",
      "columnName": "Item Name"
    },
    {
      "keyName": "batchID",
      "columnName": "Batch No"
    },
    {
      "keyName": "quantityInHand",
      "columnName": "Quantity on Hand"
    },
    {
      "keyName": "adjustedQuantity",
      "columnName": "Adjusted Quantity"
    },
    {
      "keyName": "adjustmentType",
      "columnName": "Adjustment Type"
    },
    {
      'columnName': 'Reason',
      'keyName': 'reason',
    }
  ]

  headerColumn = [
    {
      columnName: 'Adjustment ID :',
      keyName: 'stockAdjustmentID',
    },
    {
      columnName: 'Facility ID :',
      keyName: 'facilityID',
    },
    {
      columnName: 'Reference No :',
      keyName: 'refNo',
    },
    {
      columnName: 'Created By :',
      keyName: 'createdBy',
    },
    {
      columnName: 'Created Date :',
      keyName: 'createDate',
    }
  ]

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
