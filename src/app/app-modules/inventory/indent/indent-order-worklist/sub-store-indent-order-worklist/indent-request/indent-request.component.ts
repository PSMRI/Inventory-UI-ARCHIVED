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
import { NgForm, FormBuilder, FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { ConfirmationService } from 'app/app-modules/core/services';
import { InventoryService } from 'app/app-modules/inventory/shared/service/inventory.service';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { DataStorageService } from '../../../../shared/service/data-storage.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-indent-request',
  templateUrl: './indent-request.component.html',
  styleUrls: ['./indent-request.component.css']
})
export class IndentRequestComponent implements OnInit {

  indentRequestForm: FormGroup;
  indentDetails: any;
  viewItemReqObj: any;
  deletedItemObject = [];
  arrayObj = [];
  editMode = false;
  deleted = false;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    public http_service: LanguageService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private dataStorageService: DataStorageService) { }

  ngOnInit() {
    this.indentRequestForm = this.createIndentRequestForm();

    if (this.dataStorageService.indentDetails && this.dataStorageService.indentDetails.orderDate) {
      this.methodForIndentEdit();
    }
    this.fetchLanguageResponse();
  }
  methodForIndentEdit() {
    this.viewItemReqObj = {
      "indentID": this.dataStorageService.indentDetails.indentID,
      "fromFacilityID": this.dataStorageService.indentDetails.fromFacilityID
    }
    if (this.viewItemReqObj != undefined || this.viewItemReqObj != null) {
      this.editMode = true;
      this.getItemList(this.viewItemReqObj);
    } else {
      this.editMode = false;
    }
  }
  createIndentRequestForm() {
    return this.fb.group({
      requestDate: new Date(),
      referenceNumber: [null, Validators.required],
      indentReason: [null, Validators.required],
      indentItemList: this.fb.array([this.initIndentItemList()])
    })
  }
  initIndentItemList() {
    return this.fb.group({
      itemID: null,
      itemName: null,
      itemNameView: null,
      qOH: null,
      requiredQty: null,
      remarks: null,
      indentOrderID: null,
      indentID: null,
      providerServiceMapID: null,
      vanID: null,
      status: null,
      deleted: false,
      processed: null,
      createdBy: null,
      createdDate: null,
      lastModDate: null,
      parkingPlaceID: null,
      fromFacilityID: null
    })
  }
  checkQuantity(itemList?: FormGroup) {
    let quantity = itemList.value.requiredQty
    if (quantity == 0) {
      this.confirmationService.alert(this.currentLanguageSet.inventory.enterQuantityGreaterThanZero)
      itemList.patchValue({ requiredQty: null });
      itemList.markAsPristine();
    }
    // else if (itemList.value.qOH < quantity) {
    //   this.confirmationService.alert('Please enter quantity less than or equal to Qty in qoh')
    //   itemList.patchValue({ requiredQty: null });
    //   itemList.markAsPristine();
    // }
  }
  addToindentItemList() {
    let IndentItemListArray = this.indentRequestForm.controls['indentItemList'] as FormArray;
    IndentItemListArray.push(this.initIndentItemList());
  }

  removeFromindentItemList(index, itemListForm?: FormGroup) {
    console.log("itemListForm", itemListForm);
    let IndentItemListArray = this.indentRequestForm.controls['indentItemList'] as FormArray;

    if (IndentItemListArray.length > 1) {
      this.deleted = true;
      let temp = {
        "createdBy": itemListForm.value.createdBy,
        "createdDate": itemListForm.value.createdDate,
        "deleted": true,
        "fromFacilityID": itemListForm.value.fromFacilityID,
        "indentID": itemListForm.value.indentID,
        "indentOrderID": itemListForm.value.indentOrderID,
        "itemID": itemListForm.value.itemID,
        "itemName": itemListForm.value.itemName,
        "lastModDate": itemListForm.value.lastModDate,
        "parkingPlaceID": itemListForm.value.parkingPlaceID,
        "processed": itemListForm.value.processed,
        "providerServiceMapID": itemListForm.value.providerServiceMapID,
        "qOH": itemListForm.value.qOH,
        "remarks": itemListForm.value.remarks,
        "requiredQty": itemListForm.value.requiredQty,
        "status": itemListForm.value.status,
        "vanID": itemListForm.value.vanID
      };
      this.deletedItemObject.push(temp);
      IndentItemListArray.removeAt(index);
    }
    else {
      itemListForm.reset();
      itemListForm.controls['itemNameView'].enable();
    }
  }
  goBack() {
    this.location.back();
    this.dataStorageService.indentDetails = undefined;
  }
  resetIndentRequestFormArray() {
    let indentRequestFormArray = this.indentRequestForm.controls['indentItemList'] as FormArray;
    indentRequestFormArray.controls.length = 0;
    this.addToindentItemList();
  }
  resetIndentRequestForm() {
    this.resetIndentRequestFormArray();
    this.indentRequestForm.reset({ requestDate: new Date() });
  }
  submitIndentRequest(indentRequestForm: FormGroup) {
    let indentRequest = JSON.parse(JSON.stringify(indentRequestForm.value.indentItemList));

    let otherDetails = {
      "refNo": indentRequestForm.value.referenceNumber,
      "reason": indentRequestForm.value.indentReason,
      "fromFacilityID": localStorage.getItem('facilityID'),
      "fromFacilityName": JSON.parse(localStorage.getItem('facilityDetail')).facilityName,
      "toFacilityID": JSON.parse(localStorage.getItem('facilityDetail')).mainFacilityID,
      "createdBy": localStorage.getItem('username'),
      "providerServiceMapID": localStorage.getItem('providerServiceID'),
      "vanID": localStorage.getItem("vanID"),
      "parkingPlaceID": localStorage.getItem("parkingPlaceID"),
      "userID": localStorage.getItem('userID')
    }

    let temp = Object.assign({}, { "indentOrder": indentRequest }, otherDetails)
    this.inventoryService.saveIndentRequest(temp)
      .subscribe(response => {
        if (response.statusCode == 200) {
          this.confirmationService.alert(this.currentLanguageSet.inventory.savedsuccessfully, 'success');
          this.router.navigate(['inventory/subStoreIndentOrderWorklist']);
        }
        this.resetIndentRequestForm();
      })
  }
  getItemList(viewItemReqObj) {
    this.inventoryService.viewItemListForSubStore(viewItemReqObj).subscribe((viewItemResponse) => {
      if (viewItemResponse.statusCode == 200) {
        let itemListDetails = viewItemResponse.data;
        let indentRequestFormArray = this.indentRequestForm.controls['indentItemList'] as FormArray;

        for (let i = 0; i < itemListDetails.length; i++) {
          indentRequestFormArray.at(i).patchValue(itemListDetails[i]);
          indentRequestFormArray.at(i).patchValue({
            "itemNameView": itemListDetails[i].itemName
          });
          (<FormGroup>indentRequestFormArray.at(i)).controls['itemNameView'].disable();
          if (indentRequestFormArray.length < itemListDetails.length)
            this.addToindentItemList();
        }

        this.indentRequestForm.patchValue({
          requestDate: new Date(this.dataStorageService.indentDetails.createdDate),
          referenceNumber: this.dataStorageService.indentDetails.refNo,
          indentReason: this.dataStorageService.indentDetails.reason,
        });
      }
    })
  }
  updateIndentRequest(indentRequestForm: FormGroup) {
    let addedDeletedObject: any;
    let temp: any;
    let indentRequest = JSON.parse(JSON.stringify(indentRequestForm.value.indentItemList));

    if (this.deleted == true) {
      addedDeletedObject = Object.assign([], indentRequest, this.deletedItemObject);
    }


    let otherDetails = {
      "refNo": indentRequestForm.value.referenceNumber,
      "reason": indentRequestForm.value.indentReason,
      "fromFacilityID": localStorage.getItem('facilityID'),
      "fromFacilityName": JSON.parse(localStorage.getItem('facilityDetail')).facilityName,
      "toFacilityID": JSON.parse(localStorage.getItem('facilityDetail')).mainFacilityID,
      "createdBy": localStorage.getItem('username'),
      "providerServiceMapID": localStorage.getItem('providerServiceID'),
      "vanID": localStorage.getItem("vanID"),
      "parkingPlaceID": localStorage.getItem("parkingPlaceID"),
      "userID": localStorage.getItem('userID'),
      "indentID": this.dataStorageService.indentDetails.indentID,
      "orderDate": this.dataStorageService.indentDetails.orderDate,
      "status": this.dataStorageService.indentDetails.status,
      "deleted": this.dataStorageService.indentDetails.deleted,
      "processed": this.dataStorageService.indentDetails.processed,
      "createdDate": this.dataStorageService.indentDetails.createdDate,
      "lastModDate": this.dataStorageService.indentDetails.lastModDate,
      "vanSerialNo": this.dataStorageService.indentDetails.vanSerialNo
    }
    if (this.deleted == true) {
      temp = Object.assign({}, { "indentOrder": addedDeletedObject }, otherDetails)
    } else {
      temp = Object.assign({}, { "indentOrder": indentRequest }, otherDetails)

    }
    this.inventoryService.updateIndentRequest(temp)
      .subscribe(response => {
        if (response.statusCode == 200) {
          this.confirmationService.alert(response.data.response, 'success');
          this.dataStorageService.indentDetails = undefined;
          this.router.navigate(['inventory/subStoreIndentOrderWorklist']);
        }
        this.resetIndentRequestForm();
      })
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
