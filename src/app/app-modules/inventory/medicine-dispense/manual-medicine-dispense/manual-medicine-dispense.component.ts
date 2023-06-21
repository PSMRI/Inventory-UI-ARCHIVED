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
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { InventoryService } from './../../shared/service/inventory.service';
import { SelectBatchComponent } from './select-batch/select-batch.component';
import { ConfirmationService } from './../../../core/services/confirmation.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-manual-medicine-dispense',
  templateUrl: './manual-medicine-dispense.component.html',
  styleUrls: ['./manual-medicine-dispense.component.css']
})
export class ManualMedicineDispenseComponent implements OnInit {

  @Input('beneficaryDetail')
  beneficaryDetail: any;

  app: any;

  @Output() resetBeneficiaryDetail: EventEmitter<any> = new EventEmitter();

  manualItemDispenseForm: FormGroup;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(private fb: FormBuilder,
    private dialog: MdDialog,
    private router: Router,
    public http_service:LanguageService,
    private confirmationService: ConfirmationService,
    private dataStorageService: DataStorageService,
    private inventoryService: InventoryService) { }

  ngOnInit() {
    this.app = this.getApp();
    this.manualItemDispenseForm = this.initManualDispenseForm();
    this.subscribeToFormChange();
    this.fetchLanguageResponse();
  }

  subscribeToFormChange() {
    this.manualItemDispenseForm.controls['itemID'].valueChanges
      .subscribe(value => {
        if (value)
          setTimeout(() => { this.selectBatch() }, 0);
      })
  }

  ngOnChanges() {
  }

  getApp() {
    console.log(sessionStorage.getItem('host'))
    if (sessionStorage.getItem('host')) {
      return sessionStorage.getItem('host')

    } else {
      return 'STORE';

    }
  }
  resetDependent() {
    this.manualItemDispenseForm.patchValue({
      itemID: null,
      quantityInHand: null,
      quantityDispensed: null
    })
  }

  initManualDispenseForm(): FormGroup {
    return this.fb.group({
      itemName: null,
      itemID: null,
      quantityInHand: null,
      quantityDispensed: null,
      batchList: new FormArray([]),
    })
  }

  initBatchForm(): FormGroup {
    return this.fb.group({
      batchNo: null,
      quantityOnBatch: null,
      expiryDate: null,
      entryDate: null,
      quantityOfDispense: null,
    })
  }

  get quantityInHand() {
    return this.manualItemDispenseForm.controls['quantityInHand'].value;
  }

  manualDispenseList = [];
  selectBatch() {
    let batchList = <FormArray>this.manualItemDispenseForm.controls['batchList'];
    let batchListLength = batchList.length
    if (batchList && batchListLength > 0) {
      for (let j = 0; j <= batchListLength; j++) {
        batchList.removeAt(0);
      }
      this.getItemBatchList(null, this.manualItemDispenseForm.value);
    } else {
      this.getItemBatchList(null, this.manualItemDispenseForm.value);
    }
  }

  getItemBatchList(editIndex, formValue) {
    let itemBatchList = [];
    let requestObjectGetBatchList = {
      "facilityID": localStorage.getItem('facilityID'),
      "itemID": formValue.itemID
    }
    this.inventoryService.getItemBatchList(requestObjectGetBatchList).subscribe((response) => {
      if (response.statusCode == 200) {
        if (response.data.length > 0) {
          itemBatchList = response.data;
          this.openModalTOSelectBatch(editIndex, formValue, itemBatchList);
        } else {
          this.confirmationService.alert(this.currentLanguageSet.inventory.noBatchavailableforthisItem);
        }
      } else {
        this.confirmationService.alert(response.errorMessage, 'error');
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  openModalTOSelectBatch(editIndex, formValue, itemBatchList) {
    let mdDialogRef: MdDialogRef<SelectBatchComponent> = this.dialog.open(SelectBatchComponent, {
      data: {
        batchList: itemBatchList,
        editBatch: formValue,
        editIndex: editIndex
      },
      panelClass: 'fit-screen',
      disableClose: false
    });
    mdDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (editIndex != null) {
          this.manualDispenseList.splice(editIndex, 1);
          this.manualDispenseList.push(result.value);
          this.manualItemDispenseForm.reset();
        } else {
          this.manualDispenseList.push(result.value);
          this.manualItemDispenseForm.reset();
        }
      }
    })
  }

  removeManualDispenseItem(i) {
    this.manualDispenseList.splice(i, 1);
  }

  editItem(item, i) {
    this.getItemBatchList(i, item);
  }

  stockExitList = [];
  createStockExitList() {
    this.manualDispenseList.forEach((dispenseItem) => {
      dispenseItem.batchList.forEach((batch) => {
        console.log('batch', batch);
        let dispensedItem = {
          "createdBy": localStorage.getItem('userID'),
          "itemID": batch.batchNo.itemID,
          "itemStockEntryID": batch.batchNo.itemStockEntryID,
          "quantity": batch.quantityOfDispense
        }
        this.stockExitList.push(dispensedItem);
      })
    })
    let dispensingItem = Object.assign({}, { issuedBy: this.app }, this.beneficaryDetail, { itemStockExit: this.stockExitList }, {
      "vanID": localStorage.getItem("vanID"),
      "parkingPlaceID": localStorage.getItem("parkingPlaceID")
    });
    return dispensingItem
  }
  save(print) {
    this.saveItem(print);
  }
  saveItem(print) {
    let dispensingItem = this.createStockExitList();
    console.log('dispensingItem', dispensingItem);
    this.inventoryService.saveStockExit(dispensingItem).subscribe((response) => {
      if (response.statusCode == 200) {
        if (print) {
          this.saveAndPrintPage();
        } else {
          this.confirmationService.alert(this.currentLanguageSet.inventory.savedsuccessfully, 'success');
          this.manualDispenseList = [];
          this.manualItemDispenseForm.reset();
          this.resetBeneficiaryDetails();
        }

      } else {
        this.confirmationService.alert(response.errorMessage, 'error');
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  resetBeneficiaryDetails() {
    console.log('event', event);
    this.resetBeneficiaryDetail.emit();
  }

  createPrintableData() {
    let printableData = []
    let i = 0;
    this.manualDispenseList.forEach((dispenseItem) => {
      dispenseItem.batchList.forEach((batch) => {
        console.log('batch', batch);
        i = i + 1;
        let dispensedItem = {
          'sNo': i,
          'itemName': dispenseItem.itemName,
          'batchNo': batch.batchNo.batchNo,
          'expiryDate': moment(batch.expiryDate).format('DD-MM-YYYY'),
          'qod': batch.quantityOfDispense
        }
        printableData.push(dispensedItem);
      })
    })
    let beneficaryDetail = Object.assign({ visitedDate: moment(this.beneficaryDetail.visitDate).format('DD-MM-YYYY') }, this.beneficaryDetail)
    console.log('beneficaryDetail', JSON.stringify(beneficaryDetail, null, 4));

    let manualDispenseItem = Object.assign({}, { title: this.title }, { headerColumn: this.headerColumn }, { headerDetail: beneficaryDetail }, { columns: this.columns }, { printableData: printableData });
    return manualDispenseItem;
  }


  title = {
    modalTitle: 'Manual Dispense',
    headerTitle: 'Dispense Detail',
    tableTitle: 'Dispensed Item'
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
      "keyName": "batchNo",
      "columnName": "Batch No"
    },
    {
      "keyName": "expiryDate",
      "columnName": "Expiry Date"
    },
    {
      "keyName": "qod",
      "columnName": "Qty dispensed"
    },
  ]

  headerColumn = [
    {
      columnName: 'Name :',
      keyName: 'patientName',
    },
    {
      columnName: 'Beneficiary ID :',
      keyName: 'beneficiaryID',
    },
    {
      columnName: 'Gender :',
      keyName: 'gender',
    },
    {
      columnName: 'Age :',
      keyName: 'age',
    },
    {
      columnName: 'Visit ID :',
      keyName: 'visitID',
    },
    {
      columnName: 'Visit Date :',
      keyName: 'visitedDate',
    },
    {
      columnName: 'Doctor Name :',
      keyName: 'doctorName',
    },
    {
      columnName: 'Issued By :',
      keyName: 'createdBy',
    },
    {
      columnName: 'Reference :',
      keyName: 'reference',
    }
  ]

  saveAndPrintPage() {
    const manualDispenseItem = this.createPrintableData();
    this.dataStorageService.manualDispenseItem = manualDispenseItem
    let uRL = 'manualDispenseItem'
    this.router.navigate(['/inventory/dynamicPrint/', uRL])
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

