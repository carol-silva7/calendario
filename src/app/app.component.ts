import { Component, ViewChild } from '@angular/core';
import { MbscEventcalendarOptions, MbscPopupOptions, Notifications, setOptions, localePtBR} from '@mobiscroll/angular';
import { MbscDatetimeOptions } from '@mobiscroll/angular/dist/js/core/components/datetime/datetime';



setOptions({
    locale: localePtBR,
    theme: 'windows',
    themeVariant: 'light', 
    //dragToCreate: true, 
    //dragToMove: true, 
    //dragToResize: true,
});

const now = new Date();
let tempId = 4;
let deleteEvent = false;
let restoreEvent = false;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [Notifications]
})
export class AppComponent {
    constructor(private notify: Notifications) {}

    title = '';
    description = '';
    allDay = false;
    date = [now, now];
    controls = ['datetime'];
    responsive = {
        medium: {
            controls: ['calendar', 'time'],
            touchUi: false
        }
    };
    free = 'busy';
    tempEvent: any;
    isOpen = false;
    isEdit = false;
    headerText = 'New Event'
    anchor: any;
    arrow = false;
    buttons = [];
    myEvents: any = [{
        id: 1,
        start: new Date(now.getFullYear(), now.getMonth(), 8, 13),
        end: new Date(now.getFullYear(), now.getMonth(), 8, 13, 30),
        title: 'Lunch @ Butcher\'s',
        color: '#26c57d'
    }, {
        id: 2,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16),
        title: 'General orientation',
        color: '#fd966a'
    }, {
        id: 3,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 22),
        title: 'Dexter BD',
        color: '#37bbe4'
    }, {
        id: 4,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30),
        title: 'Stakeholder mtg.',
        color: '#d00f0f'
    }];

    createNewEvent(newEvent, elm) {
        deleteEvent = true;
        restoreEvent = false;

        // store new event
        this.tempEvent = newEvent;
        // fill popup with current properties
        this.fillPopup(newEvent);

        this.myEvents = [...this.myEvents, newEvent];
        this.date = [newEvent.start, newEvent.end];
        this.isEdit = false;
        this.headerText = 'New Event';
        this.buttons = this.getButtons();
        this.anchor = elm;
        this.arrow = true;
        this.isOpen = true;
    }

    fillPopup(e) {
        this.title = e.title;
        this.description = e.description;
        this.date = [e.start, e.end];
        this.allDay = e.allDay || false;
        this.free = e.free ? 'free' : 'busy';
    };

    calSettings: MbscEventcalendarOptions = {
        dragToCreate: true,
        dragToMove: true,
        dragToResize: true,
        view: {
            calendar: { labels: true }
        },
        onEventClick: (args: any) => {
            const e = args.event;

            deleteEvent = false;
            restoreEvent = true;

            // store clicked event
            this.tempEvent = e;
            this.fillPopup(e);
            this.isEdit = true;
            this.headerText = 'Edit event';
            this.buttons = this.getButtons();
            this.anchor = args.domEvent.currentTarget;
            this.arrow = true;
            this.isOpen = true;
        },
        onEventCreated: (args: any) => {
            setTimeout(() => {
                this.createNewEvent(args.event, args.target);
            });
        },
        onEventDeleted: (args: any) => {
            setTimeout(() => {
                this.myEvents = this.myEvents.filter(el => el.id !== args.event.id);
                this.notify.toast({
                    message: 'Event deleted'
                });
            });
        }
    };

    popupSettings: MbscPopupOptions = {
        display: 'bottom',
        contentPadding: false,
        fullScreen: true,
        onClose: () => {
            if (deleteEvent) {
                // delete temporary event if there is one
                this.myEvents = this.myEvents.filter(item => item.id !== this.tempEvent.id);
            } else {
                // put back original event without the changes
                this.updateEventInList({ ...this.tempEvent });
            }
            this.tempEvent = null;
            // close popup;
            this.isOpen = false;
        },
        responsive: {
            medium: {
                display: 'bubble',
                width: 400,
                fullScreen: false,
                touchUi: false
            }
        }
    };

    dateSettings: MbscDatetimeOptions = {
      //  select: 'range',
       // showRangeLabels: false,
        onChange: (ev) => {
            const d = this.date;
            // update current event's start date and end date
            this.updateEventInList({ start: d[0], end: d[1] })
            if (ev.inst.isVisible()) {
                // hide arrow
                this.arrow = false;
            }
        }
    };

    getEventIndex(id) {
        // find event index by id
        return this.myEvents.findIndex(x => x.id === id);
    }

    updateEventInList(partial) {
        // get current event's index
        const index = this.getEventIndex(this.tempEvent.id);
        // copy old event list
        const newEventList = [...this.myEvents];
        // delete old event and replace it with a new one with the updated property
        newEventList.splice(index, 1, { ...this.myEvents[index], ...partial });
        // update list
        this.myEvents = newEventList;
    }

    titleChange(ev) {
        // update current event's title property
        this.updateEventInList({ title: ev.target.value });
    }

    descriptionChange(ev) {
        // update current event's description property
        this.updateEventInList({ description: ev.target.value });
    }

    allDayChange(ev) {
        const checked = this.allDay;
        // change range settings based on the allDay
        this.controls = checked ? ['date'] : ['datetime'];
        this.responsive = checked ? {
            medium: {
                controls: ['calendar'],
                touchUi: false
            }
        } : {
            medium: {
                controls: ['calendar', 'time'],
                touchUi: false
            }
        };
        // update current event's allDay property
        this.updateEventInList({ allDay: checked });
        // set popup arrow
        this.arrow = false;
    }

    statusChange(ev) {
        // update current event's free property
        this.updateEventInList({ free: ev.target.value == 'free' });
    }

    // delete current event
    deleteEvent() {
        this.myEvents = this.myEvents.filter(el => el.id != this.tempEvent.id);
        this.isOpen = false;
        this.notify.toast({
            message: 'Event deleted'
        });
    }

    getButtons() {
        // change popup buttons based on add or edit mode
        if (this.isEdit) {
            return [
                'cancel',
                {
                    handler: () => {
                        // on save we only have to close the popup
                        // event is already saved during the edit
                        this.isOpen = false;
                    },
                    keyCode: 'enter',
                    text: 'Save',
                    cssClass: 'mbsc-popup-button-primary'
                }
            ];
        } else {
            return [
                'cancel',
                {
                    handler: () => {
                        this.tempEvent = null;
                        // close popup
                        this.isOpen = false;
                    },
                    keyCode: 'enter',
                    text: 'Add',
                    cssClass: 'mbsc-popup-button-primary'
                }
            ];
        }
    }
}