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
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';

import { InventoryService } from './../../inventory/shared/service/inventory.service';
import { ConfirmationService } from './../../core/services/confirmation.service';
import { SearchComponent } from './../../core/components/search/search.component';
import { PatientReturnBatchDetailsComponent } from './../../inventory/patient-return/patient-return-batch-details/patient-return-batch-details.component';
import { BenificiaryDetailsComponent } from './benificiary-details/benificiary-details.component';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-patient-return',
  templateUrl: './patient-return.component.html',
  styleUrls: ['./patient-return.component.css']
})
export class PatientReturnComponent implements OnInit {

  patientReturnForm: FormGroup;
  beneficiaryDetailsList = [];

  itemMasterList = [];
  benSelected: Boolean = false;

  selectedItemList = [];
  filterItemList = [];
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private fb: FormBuilder,
    private dialog: MdDialog,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService, ) { }

  ngOnInit() {
    this.patientReturnForm = this.createPatientReturnForm();
    this.fetchLanguageResponse();
  }

  createPatientReturnForm() {
    return this.fb.group({
      beneficiaryIDOrPhoneNumber: null,
      beneficiaryID: [{ value: null, disabled: true }],
      benRegId: null,
      name: [{ value: null, disabled: true }],
      age: [{ value: null, disabled: true }],
      gender: [{ value: null, disabled: true }],
    })
  }

  get beneficiaryIDOrPhoneNumber() {
    return this.patientReturnForm.controls['beneficiaryIDOrPhoneNumber'].value;
  }

  get beneficiaryID() {
    return this.patientReturnForm.controls['beneficiaryID'].value;
  }

  get name() {
    return this.patientReturnForm.controls['name'].value;
  }

  get age() {
    return this.patientReturnForm.controls['age'].value;
  }

  get gender() {
    return this.patientReturnForm.controls['gender'].value;
  }

  get benRegId() {
    return this.patientReturnForm.controls['benRegId'].value;
  }

  initpatientReturnList() {
    return this.fb.group({
      itemName: null,
      batchID: null,
      issueQuantity: null,
      dateOfIssue: null,
      returnQuantity: null,
    })
  }

  identityQuickSearch(beneficiaryIDOrPhoneNumber: String) {
    if (beneficiaryIDOrPhoneNumber.length == 10) {
      this.phoneNumberSearch(beneficiaryIDOrPhoneNumber);
    } else if (beneficiaryIDOrPhoneNumber.length == 12) {
      this.beneficiarySearch(beneficiaryIDOrPhoneNumber);
    }
  }

  openBenDetailsModal() {
    const mdDialogRef:
      MdDialogRef<BenificiaryDetailsComponent>
      = this.dialog.open(BenificiaryDetailsComponent, {
        // height: '90%',
        width: '80%',
        panelClass: 'fit-screen',
        data: {
          beneficiaryDetailsList: this.beneficiaryDetailsList
        },
        disableClose: false
      });
    mdDialogRef.afterClosed().subscribe((benificiary) => {
      if (benificiary) {
        this.patchData(benificiary);
        this.itemSearch(benificiary);
      }
    })
  }

  phoneNumberSearch(phoneNumber) {
    this.inventoryService.getBeneficiaryByPhoneNumber({
      'phoneNo': phoneNumber
    })
      .subscribe((response) => {
        console.log('response', response);
        this.reponseDataCheck(response);
      })
  }

  reponseDataCheck(response) {
    if (response.statusCode == 200) {
      if (response.data.length > 0) {
        this.beneficiaryDetailsList = response.data;
        this.openBenDetailsModal();
      } else {
        this.confirmationService.alert(this.currentLanguageSet.inventory.nobeneficiarydetailsavailable);
      }
    }
  }
  beneficiarySearch(beneficiaryID) {
    this.inventoryService.getBeneficiaryByBeneficiaryID({
      'beneficiaryID': beneficiaryID
    })
      .subscribe((response) => {
        console.log('response', response);
        this.reponseDataCheck(response);
      })
  }
  openSearchDialog() {

  }
  patchData(benDetails) {
    this.patientReturnForm.patchValue({
      beneficiaryID: benDetails.beneficiaryID,
      benRegId: benDetails.beneficiaryRegID,
      name: benDetails.firstName ? benDetails.firstName : "" + benDetails.lastName ? benDetails.lastName : "",
      age: benDetails.age,
      gender: benDetails.m_gender.genderName
    })
  }

  itemSearch(beneficiary: any) {
    console.log("Beneficiary details..", beneficiary);
    if (beneficiary != undefined) {
      this.inventoryService.getItemList({
        "benRegID": beneficiary.beneficiaryRegID,
        "facilityID": localStorage.getItem('facilityID')
      }).subscribe((response) => {
        console.log(this.itemMasterList);

        this.itemMasterList = response.data;
        this.benSelected = true;

        this.filterItemList = response.data;
      });
    }
  }

  resetBenDetails(event) {
    console.log('event', event);
    this.benSelected = false;
    this.patientReturnForm.reset();
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
