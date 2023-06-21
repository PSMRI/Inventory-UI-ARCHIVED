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
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';

@Injectable()
export class PrescribedDrugService {

  dummify = {
    prescribed: {
      prescriptionID: '1A22eddt5',
      prescribedDate: '08/08/2018',
      consultantName: 'Balu Lal',
      status: false,
      prescribedDrugs: [{
        drugID: '123431',
        drugName: 'SomeMed CapsoTableSyruped',
        batchNumber: '245u67ujt',
        qoh: 209,
        quantityPrescribed: 203,
        quantiyIssued: 209
      }, {
        drugID: '123431',
        drugName: 'SomeMed CapsoTableSyruped',
        batchNumber: '245u67ujt',
        qoh: 209,
        quantityPrescribed: 203,
        quantiyIssued: 209
      }, {
        drugID: '123431',
        drugName: 'SomeMed CapsoTableSyruped',
        batchNumber: '245u67ujt',
        qoh: 209,
        quantityPrescribed: 203,
        quantiyIssued: 209
      }]
    }
  };

  constructor(private http: Http) { }

  getPrescription(reqObj) {
    const vanID = localStorage.getItem('vanID');
    const parkingPlaceID = localStorage.getItem('parkingPlaceID');
    const msgObj = Object.assign(reqObj, {vanID}, {parkingPlaceID});

    // return Observable.of(this.dummify);
    return this.http.post(environment.getPrescriptions, msgObj)
    .map(res => res.json());
  }



  allocateBatches(list, facilityID) {
    return this.http.post(`${environment.allocateBatchStockUrl}/${facilityID}`, list)
    .map(res => res.json());
  }

  saveStockExit(dispensingItem) {
    const vanID = localStorage.getItem('vanID');
    const parkingPlaceID = localStorage.getItem('parkingPlaceID');
    const msgObj = Object.assign(dispensingItem, {vanID}, {parkingPlaceID});
    console.log('dispensingItem', JSON.stringify(dispensingItem, null, 4));

    return this.http.post(environment.saveStockExitUrl, msgObj)
      .map(res => res.json());
  }

}
