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
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, trigger, style, transition, animate, group } from '@angular/core';
import { InventoryService } from '../shared/service/inventory.service';
import { MdRadioChange } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { NgForm, FormBuilder, FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ConfirmationService } from '../../core/services/confirmation.service';
import * as moment from 'moment';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-store-stock-transfer',
  templateUrl: './store-stock-transfer.component.html',
  styleUrls: ['./store-stock-transfer.component.css'],
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
export class StoreStockTransferComponent implements OnInit {

  stockTransferForm: FormGroup;
  arrayHead: FormArray;
  facilityID: any;
  stores = [];
  filterStore = [];
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private inventoryService: InventoryService,
    private alertService: ConfirmationService,
    private fb: FormBuilder,
    private router: Router,
    private  http_service: LanguageService,
    private confirmationService: ConfirmationService) {

    this.checkFacility();

  }

  ngOnInit() {
    this.getAllStore();
    this.stockTransferForm = this.createStockTransferForm();
    this.setArrayHead();
    this.updateTodaysData();
    this.fetchLanguageResponse();
  }

  checkFacility() {
    this.facilityID = localStorage.getItem('facilityID');
    if (this.facilityID == null || this.facilityID <= 0) {
      this.router.navigate(['/inventory']);
    }
  }

  getAllStore() {
    let serviceProviderId = localStorage.getItem('providerServiceID');
    this.inventoryService.getAllStore(serviceProviderId).subscribe((data) => {
      this.stores = data.filter(item => item.deleted == false);
      this.filterStore = this.filterSubStore(this.stores, this.facilityID);
    })
  }

  filterSubStore(storeList, facilityID) {
    let source = storeList.filter(item => item.facilityID == facilityID);

    let children = [];
    let queue = [];
    queue.push(source[0]);

    while (queue.length > 0) {
      let front = queue.shift();
      children.push(front);
      storeList.forEach(item => {
        if (item.mainFacilityID && item.mainFacilityID == front.facilityID)
          queue.push(item);
      });
    }

    let index = children.indexOf(source[0]);
    children.splice(index, 1);

    let parent = storeList.filter(item => source[0].mainFacilityID && item.facilityID == source[0].mainFacilityID);
    let sibling = storeList.filter(item => source[0].mainFacilityID && item.mainFacilityID == source[0].mainFacilityID);

    let index2 = sibling.indexOf(source[0]);
    sibling.splice(index2, 1);

    const final = new Set(parent.concat(sibling).concat(children));
    return Array.from(final);
  }

  createStockTransferForm() {
    return this.fb.group({
      dated: { value: null, disabled: true },
      referenceNumber: [null, Validators.required],
      transferTo: [null, Validators.required],
      createdBy: [null, Validators.required],
      providerServiceMapID: [null, Validators.required],
      itemArray: new FormArray([this.createItem()])
    })
  }

  createItem() {
    return this.fb.group({
      batchNo: [null, Validators.required],
      itemStockEntryID: [null, Validators.required],
      itemName: [null, Validators.required],
      qoh: [null, Validators.required],
      quantity: [null, Validators.required]
    })
  }

  setArrayHead() {
    this.arrayHead = this.stockTransferForm.controls['itemArray'] as FormArray;
  }

  updateTodaysData() {
    this.stockTransferForm.patchValue({
      dated: moment(new Date()).format('DD/MM/YYYY'),
      createdBy: localStorage.getItem('username'),
      providerServiceMapID: localStorage.getItem('providerServiceID')
    });
  }


  addTransfer() {
    if (this.arrayHead.valid) {
      this.arrayHead.push(this.createItem());
    } else {
      this.confirmationService.alert(this.currentLanguageSet.inventory.pleaseenterthevaluesfirst, 'info');
    }
  }


  removeTransfer(index, length) {
    let stockArray = this.stockTransferForm.controls['itemArray'] as FormArray;
    if (stockArray.length > 1) {
      stockArray.removeAt(index);
    }
    
    if (index === 0 && length === 1)
      this.addTransfer();
  }

  matcher(control, form) {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

  resetForm() {
    this.resetItemArray();
    this.stockTransferForm.reset();
    this.updateTodaysData();
  }

  resetItemArray() {
    this.stockTransferForm.removeControl('itemArray');
    this.stockTransferForm.addControl('itemArray', new FormArray([this.createItem()]));
    this.setArrayHead();
  }

  checkReferences() {
    if (this.stockTransferForm.value.referenceNumber && this.stockTransferForm.value.transferTo) {
      return true;
    } else {
      this.resetItemArray();
      return false;
    }
  }

  checkQuantityAvailable(index) {
    if (this.arrayHead.at(index).value.quantity > this.arrayHead.at(index).value.qoh) {
      this.confirmationService.alert(this.currentLanguageSet.inventory.transferquantitycannotbegreater, 'info');
      this.arrayHead.at(index).patchValue({
        quantity: null
      })
    }
  }

  submitTransfers() {
    console.log(this.stockTransferForm.value)
    this.inventoryService.saveStockTransfer(this.serviceDataMapper(this.stockTransferForm.value))
      .subscribe((res) => {
        if (res && res.response) {
          this.confirmationService.alert(this.currentLanguageSet.inventory.savedsuccessfully, 'success');
          this.resetForm();
        }
      })
  }

  serviceDataMapper(formValues) {
    return {
      createdBy: formValues.createdBy,
      refNo: formValues.referenceNumber,
      providerServiceMapID: formValues.providerServiceMapID,
      transferFromFacilityID: this.facilityID,
      vanID: localStorage.getItem("vanID"),
      parkingPlaceID: localStorage.getItem("parkingPlaceID"),
      transferToFacilityID: formValues.transferTo.facilityID,
      itemStockExit: this.mapItemsForService(formValues.itemArray, formValues.createdBy)
    }
  }

  mapItemsForService(itemArray, createdBy) {
    const itemStockExit = [];
    itemArray.forEach(element => {
      itemStockExit.push({
        createdBy: createdBy,
        itemStockEntryID: element.itemStockEntryID,
        quantity: element.quantity
      })
    });
    return itemStockExit;
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
