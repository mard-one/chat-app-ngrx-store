import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import * as io from "socket.io-client";

import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";

import * as fromStore from "../../store"
import {
  getMessageThread,
  LoadMessageThread,
  getContactThread,
  LoadContactThread
} from "../../store";

import { User } from "../../models/user.model"

import { ContactService } from "../../services/contact.service";
import { AuthService } from "../../services/auth.service";
import { ThreadService } from "../../services/thread.service";
import { MessageService } from "../../services/message.service";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-chatroom",
  templateUrl: "./chatroom.component.html",
  styleUrls: ["./chatroom.component.css"]
})
export class ChatroomComponent implements OnInit {
  // profile = { userData: { contactThread: null } };
  chosenUser: {user: any, messageThread: {any}};
  messageThread$: Observable<any>;
  contactThread$: Observable<any>;

  formMessage: FormGroup;
  formContact: FormGroup;
  // message
  // messageClass
  // processing = false
  // usersInContactThread
  // usersInMessageThread
  // chosenUser
  // tempMessage

  private socket;
  // private messagesUnread

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private authService: AuthService,
    private threadService: ThreadService,
    private messageService: MessageService,
    private router: Router,
    private store: Store<fromStore.ChatState>
  ) {
    (() => {
      this.formMessage = this.formBuilder.group({ message: "" });
      this.formContact = this.formBuilder.group({ username: "" });
    })();
  }

  ngOnInit() {
    this.store.dispatch(new LoadMessageThread());
    this.store.dispatch(new LoadContactThread());
    this.messageThread$ = this.store.select(getMessageThread);
    this.contactThread$ = this.store.select(getContactThread);
    this.store.select(getMessageThread).subscribe(messageThread => {
      console.log("message thread", messageThread);
    });
    this.store.select(getContactThread).subscribe(contactThread => {
      console.log("contact thread", contactThread);
    });
    // console.log("message thread", this.messageThread$)
    // this.store.dispatch(new fromStore.LoadChosenUser());
    // this.apiService.pageInit().subscribe(userData => {
    //   this.profile = userData;
    //   console.log(this.profile);
    // });
    this.socket = io.connect("http://localhost:8080");
    this.socket.on("exception", data => {
      console.log(data);
      // this.tempMessage = null
    });
    this.socket.on("success", data => {
      console.log(data);
      //   this.threadService.getAllMessageThread().subscribe((data)=>{
      //     // console.log("success")
      //     this.usersInMessageThread = data.users
      //     console.log("this.usersInMessageThread", this.usersInMessageThread)
      //   })
      //   if(this.chosenUser){
      //     this.chosenUser.messages = data.updatedMessageThread.messages
      //     console.log("this.chosenUser", this.chosenUser)
      //   }
      //   this.tempMessage = null
      //   this.countUnreadMessages(this.usersInMessageThread)
      // })
      //
      // this.contactService.getAllContacts().subscribe((data)=>{
      //   this.usersInContactThread = data.users
      // })
      // this.threadService.getAllMessageThread().subscribe((data)=>{
      //   this.usersInMessageThread = data.users
      //
      //   this.countUnreadMessages(this.usersInMessageThread)
    });
  }

  chooseUserFromMessageThread(user) {
    console.log("message user", user)
    this.chosenUser = { user: user.chatBetween[0], messageThread: user };
    console.log("message chosen user", this.chosenUser);
    // console.log(user);
    // this.chosenUser$ = this.store
    //   .select(fromStore.getChosenUser)
    // this.store.select(fromStore.getChosenUser).subscribe(state=>{
    //   // this.chosenUser$ = state;
    //   console.log(state);
    // })
    // console.log(this.chosenUser$);
  }
  chooseUserFromContactThread(user) {
    console.log("contact user", user)
    this.chosenUser = { user: user, messageThread: user.messageThread[0] };
    console.log("contact chosen user", this.chosenUser);
  }

  // sendMessage() {
  //   this.socket.emit("sendMessage", {
  //     token: localStorage.getItem("token"),
  //     reciever: this.chosenUser,
  //     message: this.formMessage.get("message").value
  //   });
  // }

  sendMessage() {
    // this.tempMessage = { message: this.formChat.get('message').value, sentAt: new Date()}
    this.socket.emit("sendMessage", {
      token: localStorage.getItem("token"),
      reciever: this.chosenUser.user,
      message: this.formMessage.get("message").value
    });
    this.formMessage.reset();
  }

  addContact() {
    this.disableForm();
    var user = {
      username: this.formContact.get("username").value
    };
    this.contactService.addContact(user).subscribe(data => {
      if (!data.success) {
        this.enableForm();
      } else {
        // console.log("data", data);
        setTimeout(() => {
          $("#contactModal").modal("hide");
          this.enableForm();
          this.formContact.reset();
        }, 2000);
      }
    });
  }

  disableForm() {
    // console.log("disable working")
    this.formContact.controls["username"].disable();
  }
  enableForm() {
    // console.log("enable working")
    this.formContact.controls["username"].enable();
  }
  goBack() {
    this.formContact.reset();
  }

  // countUnreadMessages(usersInMessageThread){
  //   let unread = 0
  //   usersInMessageThread.messageThread.forEach((userMessage)=>{
  //     userMessage.messages.forEach((message)=>{
  //       if(!message.isRead){
  //         unread++
  //       }
  //     })
  //     this.messagesUnread = {messageThreadId: userMessage._id, unread: unread}
  //   })
  //   // console.log(this.messagesUnread)
  //   return false
  // }
}