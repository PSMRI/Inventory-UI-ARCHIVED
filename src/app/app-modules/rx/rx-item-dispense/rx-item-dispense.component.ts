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
import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormArray, FormControl, FormGroup } from '@angular/forms';
import { PrescribedDrugsUtils } from '../shared/utility';
import { BatchViewService } from './../../core/services/rx-batchview.service';
import { PrescribedDrugService } from './../shared/service/prescribed-drug.service';
import { ConfirmationService } from './../../core/services/confirmation.service';
import { LanguageService } from '../../core/services/language.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
@Component({
  selector: 'app-rx-item-dispense',
  templateUrl: './rx-item-dispense.component.html',
  styleUrls: ['./rx-item-dispense.component.css']
})
export class RxItemDispenseComponent implements OnInit, OnChanges {

  utils = new PrescribedDrugsUtils(this.fb);


  @Input('prescription') prescription: any;
  @Input('issueType') issueType: Number;
  // issuteType 0 means Manual and 1 means System

  // @Output() public onDispense: EventEmitter<any> = new EventEmitter();

  prescriptionForm: FormGroup;
  prescriptionFormEDL: FormGroup;
  allocated: Boolean = true;
  facilityID: any;
  currentLanguageSet: any;
  copyprescription: any;
  languageComponent: SetLanguageComponent;

  constructor(
    private fb: FormBuilder,
    private batchViewService: BatchViewService,
    private prescribedDrugService: PrescribedDrugService,
    private confirmationService: ConfirmationService,
    private http_service : LanguageService
  ) { }

  ngOnInit() {
    this.fetchLanguageResponse();
    // this.http_service.currentLangugae$.subscribe(response =>this.currentLanguageSet = response);
    this.facilityID = localStorage.getItem('facilityID')
    this.copyprescription = JSON.parse(JSON.stringify(this.prescription));
    this.loadForm(this.prescription);
  
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes['issueType'].firstChange) {
      this.changeIssueType();
    }
  }
  filteredDrugMaster = [];
  filteredDrugMasterEdl = [];
  loadForm(prescription): void {   
    const drugMasterCopy = Object.assign([], prescription);
    this.filteredDrugMaster = [];
    drugMasterCopy.itemList.forEach(element => {
      if (element.isEDL === true || element.batchList.length > 0) {
       this.filteredDrugMaster.push(element);
      }
      else{
        this.filteredDrugMasterEdl.push(element);
      }
    })    
    prescription.itemList = this.filteredDrugMaster;
    this.copyprescription.itemList = this.filteredDrugMasterEdl;
    this.prescriptionForm = this.utils.initPrescriptionForm(prescription, this.issueType);
    console.log('knock knock')
    console.log(this.prescriptionForm)
    console.log(this.prescription)

    this.changeIssueType();
  }



  allocate(): void {
    this.getBatchList();

  }


  getBatchList() {
    const formItemValues = this.prescriptionForm.controls['itemList'].value;
    const meds = [];
    formItemValues.map(obj => meds.push({ itemID: obj.drugID, quantity: obj.qtyPrescribed }));
    this.prescribedDrugService.allocateBatches(meds, this.facilityID)
      .subscribe((batches) => {
        if (batches.statusCode == 200) {
          const data = batches.data;
          data.map(batch => this.applyBatches(batch.itemID, batch.itemBatchList));
          this.allocated = true;
        } else {
          this.allocated = false;
          this.confirmationService.alert(this.currentLanguageSet.inventory.insufficientQuantity, 'info');
        }
      })

  }

  applyBatches(itemID, batches) {
    console.log(itemID, batches, 'checko');
    const formItemValues = this.prescriptionForm.controls['itemList'].value;
    const itemIndex = formItemValues.map(function (e) { return e.drugID; }).indexOf(itemID);
    console.log(itemIndex, 'indexx')
    this.allocateAtIndex(itemIndex, batches);
  }

  allocateAtIndex(index, batches) {
    const formItems = <FormArray>this.prescriptionForm.controls['itemList'];
    const currentGroup: FormGroup = <FormGroup>formItems.at(index);
    const selectionBatchList: FormArray = <FormArray>currentGroup.controls['selectionBatchList'];
    const batchList: FormArray = <FormArray>currentGroup.controls['batchList'];
    this.clearBatchArray(batchList);
    this.clearBatchArray(selectionBatchList);
    let dispensed = 0;
    batches.map(batch => {
      selectionBatchList.push(this.utils.initBatchListElement(batch, this.issueType))
      batchList.push(this.utils.initBatchListElement(batch, this.issueType))
      dispensed += +batch.quantity;
    });

    currentGroup.patchValue({
      qtyDispensed: dispensed
    })
    currentGroup.controls['selectionBatchList'] = selectionBatchList;
    currentGroup.controls['batchList'] = batchList;

  }

  // saveCall(): void {
  //   this.onDispense.emit(this.prescription);
  // }
  changeIssueType() {
    const formItems = <FormArray>this.prescriptionForm.controls['itemList'];
    formItems.value.forEach((element, i) => {
      const currentGroup: FormGroup = <FormGroup>formItems.at(i);
      const selectionBatchList: FormArray = <FormArray>currentGroup.controls['selectionBatchList'];
      const batchList: FormArray = <FormArray>currentGroup.controls['batchList'];

      this.clearBatchArray(batchList);
      this.clearBatchArray(selectionBatchList);

      if (this.issueType == 0) {
        this.allocated = false;
        element.preDefinedBatchList.forEach(batch => {
          selectionBatchList.push(this.utils.initBatchListElement(batch, this.issueType))
        });
      } else if( this.issueType == 1) {
        this.allocate();
      }
      currentGroup.patchValue({
        qtyDispensed: null
      })
      currentGroup.controls['selectionBatchList'] = selectionBatchList;
    });

  }

  clearBatchArray(formArray) {
    while (formArray.length >= 1) {
      formArray.removeAt(0)
    }
  }


  batchViewModal(index) {
    const formItems = <FormArray>this.prescriptionForm.controls['itemList'];
    const currentGroup: FormGroup = <FormGroup>formItems.at(index);

    const selectionBatchListValue: FormArray = <FormArray>currentGroup.controls['selectionBatchList'].value;
if (selectionBatchListValue.length){
    this.batchViewService.batches(currentGroup.value.qtyPrescribed, selectionBatchListValue, this.issueType)
      .subscribe((res) => {
        if (res && this.issueType == 0) {
          this.pushSavedBatches(res.batchList, res.selectionBatchList, res.dispensed, index)
        }
      })
    } else {
      this.confirmationService.alert(this.currentLanguageSet.alerts.medicinenotavailable, 'info');

    }
  }

  pushSavedBatches(selectedBatches, selectionList, dispensed, index) {
    const formItems = <FormArray>this.prescriptionForm.controls['itemList'];
    const currentGroup: FormGroup = <FormGroup>formItems.at(index);
    const selectionBatchList: FormArray = <FormArray>currentGroup.controls['selectionBatchList'];
    const batchList: FormArray = <FormArray>currentGroup.controls['batchList'];
    this.clearBatchArray(batchList);
    this.clearBatchArray(selectionBatchList);
    selectedBatches.map(element => {
      batchList.push(this.utils.initBatchListElement(element, this.issueType))
    });
    selectionList.map(element => {
      selectionBatchList.push(this.utils.initBatchListElement(element, this.issueType))
    });
    // console.log(batchList.value, 'batch');
    // console.log(selectionList.value, 'selection');

    currentGroup.controls['batchList'] = batchList;
    currentGroup.controls['selectionBatchList'] = selectionBatchList;
    currentGroup.patchValue({
      qtyDispensed: dispensed
    })

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
