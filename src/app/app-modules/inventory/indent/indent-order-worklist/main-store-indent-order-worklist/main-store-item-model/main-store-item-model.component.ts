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
import { Component, OnInit, Inject} from '@angular/core';
import { InventoryService } from 'app/app-modules/inventory/shared/service/inventory.service';
import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';
import { LanguageService } from 'app/app-modules/core/services/language.service';

@Component({
  selector: 'app-main-store-item-model',
  templateUrl: './main-store-item-model.component.html',
  styleUrls: ['./main-store-item-model.component.css']
})
export class MainStoreItemModelComponent implements OnInit {

  mainStoreIndentDetails: any;
  mainStoreBatchWiseItemList: any = [];
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    @Inject(MD_DIALOG_DATA) public input: any,
    public dialogRef: MdDialogRef<MainStoreItemModelComponent>,
    public http_service: LanguageService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit() {
    if (this.input) {
      this.getMainStoreItemListDetailsForIndentID(this.input.itemListDetails);
    }
    this.fetchLanguageResponse();
  }
  getMainStoreItemListDetailsForIndentID(input) {
    this.mainStoreIndentDetails = input;
    console.log("input", input);
    let viewItemReqObj = {
      "indentID": input.indentID,
      "fromFacilityID": input.fromFacilityID
    }
    // let viewItemReqObj = {
    //   "indentID": 3,
    //   "vanID": 97
    // }
    this.inventoryService.viewItemListForMainStore(viewItemReqObj).subscribe((viewItemResponse) => {
      this.mainStoreBatchWiseItemList = viewItemResponse.data
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
