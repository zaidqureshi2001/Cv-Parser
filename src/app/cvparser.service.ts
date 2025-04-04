import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CvparserService {
  private apiUrl = 'http://127.0.0.1:5000/parse-cv'
  constructor(private http : HttpClient) {}
  parseCv(file:FormData):Observable<any>{
    return this.http.post(this.apiUrl , file)
  }
}
