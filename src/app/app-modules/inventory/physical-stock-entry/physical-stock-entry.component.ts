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
import { Component, OnInit, OnChanges, ViewChild, ElementRef, trigger, style, transition, animate, group } from '@angular/core';
import { InventoryService } from '../shared/service/inventory.service';
import { MdRadioChange } from '@angular/material';
import { Observable } from 'rxjs';
import { NgForm, FormBuilder, FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-physical-stock-entry',
  templateUrl: './physical-stock-entry.component.html',
  styleUrls: ['./physical-stock-entry.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('200ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('200ms', style({ opacity: 0 }))
        ])
      ]
    )
  ],
})
export class PhysicalStockEntryComponent implements OnInit, OnChanges {

  physicalStockEntryForm: FormGroup;
  otherDetails: any;
  physicalStockList: any = [];
  today: Date;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private dialogService: ConfirmationService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.otherDetails = {
      createdBy: localStorage.getItem('username'),
      providerServiceMapID: localStorage.getItem('providerServiceID'),
      userId: localStorage.getItem('userID'),
      facilityID: localStorage.getItem('facilityID'),
      vanID: localStorage.getItem("vanID"),
      parkingPlaceID: localStorage.getItem("parkingPlaceID")
    }

    this.today = new Date();
    this.fetchLanguageResponse();
    this.physicalStockEntryForm = this.createPhysicalStockEntryForm();
  }

  ngOnChanges() {
    console.log('form', this.physicalStockEntryForm)
  }

  createPhysicalStockEntryForm() {
    return this.fb.group({
      referenceNumber: null,
      stockEntryDate: null,
      physicalStock: new FormArray([this.initPhysicalStock()])
    })
  }

  get isMedical() {
    return this.physicalStockEntryForm.controls['isMedical'].value;
  }

  initPhysicalStock() {
    return this.fb.group({
      batchNo: [null, Validators.required],
      expiryDate: null,
      itemID: [null, Validators.required],
      itemName: [null, Validators.required],
      quantity: [null, Validators.required],
      totalCostPrice: [null, Validators.required],
      isMedical: null
    });
  }

  addStock() {
    let stockForm = this.physicalStockEntryForm.controls['physicalStock'] as FormArray;
    stockForm.push(this.initPhysicalStock());
  }

  removeStock(index, stock?: FormGroup) {
    let stockForm = this.physicalStockEntryForm.controls['physicalStock'] as FormArray;
    if (stockForm.length > 1) {
      stockForm.removeAt(index);
    } else {
      stockForm.reset();
      stockForm.enable();
    }
  }

  savePhysicalStock() {
    let physicalStockEntry = JSON.parse(JSON.stringify(this.physicalStockEntryForm.value));

    physicalStockEntry.physicalStock.map(item => {
      item.createdBy = this.otherDetails.createdBy;
      item.facilityID = this.otherDetails.facilityID;
    })

    let temp = Object.assign({}, physicalStockEntry, this.otherDetails, {
      "refNo": physicalStockEntry.referenceNumber,
      "status": "Active",
      "itemStockEntry": physicalStockEntry.physicalStock,
      "physicalStock": undefined,
      "referenceNumber": undefined
    });

    // console.log("Physical Entry Stock ", JSON.stringify(temp, null, 4)); 

    this.inventoryService.savePhysicalStock(temp)
      .subscribe(response => {
        if (response.statusCode == 200 && response.data && response.data.phyEntryID) {
          this.dialogService.alert(this.currentLanguageSet.inventory.savedsuccessfully, 'success');
          this.reset();
        }
        else
          this.dialogService.alert(response.status, 'error');
      }, err => {
        this.dialogService.alert(err, 'error');
      })
  }

  reset() {
    // this.removeAllPhysicalStock(this.physicalStockEntryForm.controls['physicalStock'] as FormArray);
    // this.physicalStockEntryForm.reset();
    this.physicalStockEntryForm = this.createPhysicalStockEntryForm();

    this.today = new Date();
  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  removeAllPhysicalStock(physicalStockArray: FormArray) {
    // let len = physicalStockArray.length;

    while (physicalStockArray.length > 1) {
      physicalStockArray.removeAt(0);
    }
    // physicalStockArray.enable();
  }

  checkForDuplicateBatch(stockForm: FormGroup, index) {
    let stockList = this.physicalStockEntryForm.controls['physicalStock'].value;
    let itemID = stockForm.value.itemID;
    let batchNo = stockForm.value.batchNo;

    let temp = stockList.filter((stock, i) => {
      if (i != index)
        return (itemID && stock.itemID == itemID) && (batchNo && stock.batchNo == batchNo);
      else
        return false;
    })

    if (temp.length > 0) {
      this.dialogService.alert(this.currentLanguageSet.inventory.batchalreadypresent, "warn");
      stockForm.controls['batchNo'].reset();
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
