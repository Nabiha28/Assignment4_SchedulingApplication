class EmployeeScheduler {
    constructor() {
        this.employees = [];
        this.shifts = ["morning", "afternoon", "evening"];
        this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        
        // Initialize schedule
        this.schedule = {};
        this.days.forEach(day => {
            this.schedule[day] = {};
            this.shifts.forEach(shift => {
                this.schedule[day][shift] = [];
            });
        });
        
        this.employeeWorkdays = {};
        this.employeeDailyShifts = {};
    }
    
    addEmployee(name, preferences) {
        this.employees.push({ name, preferences });
        this.employeeWorkdays[name] = 0;
        this.employeeDailyShifts[name] = new Set();
    }
    
    assignShifts() {
        // First pass: Assign employees based on preferences
        for (const employee of this.employees) {
            const name = employee.name;
            const preferences = employee.preferences;
            
            for (const day in preferences) {
                // Skip if employee already has 5 days scheduled
                if (this.employeeWorkdays[name] >= 5) {
                    continue;
                }
                
                // Skip if employee already has a shift on this day
                if (this.employeeDailyShifts[name].has(day)) {
                    continue;
                }
                
                const shiftPref = preferences[day];
                
                // Assign to preferred shift if possible
                if (this.schedule[day][shiftPref].length < 2) {
                    this.schedule[day][shiftPref].push(name);
                    this.employeeWorkdays[name]++;
                    this.employeeDailyShifts[name].add(day);
                } else {
                    // Try to assign to another shift on the same day
                    let assigned = false;
                    for (const shift of this.shifts) {
                        if (shift !== shiftPref && this.schedule[day][shift].length < 2) {
                            this.schedule[day][shift].push(name);
                            this.employeeWorkdays[name]++;
                            this.employeeDailyShifts[name].add(day);
                            assigned = true;
                            break;
                        }
                    }
                    
                    // If still not assigned, try next day
                    if (!assigned) {
                        const nextDayIndex = (this.days.indexOf(day) + 1) % 7;
                        const nextDay = this.days[nextDayIndex];
                        
                        if (!this.employeeDailyShifts[name].has(nextDay)) {
                            for (const shift of this.shifts) {
                                if (this.schedule[nextDay][shift].length < 2) {
                                    this.schedule[nextDay][shift].push(name);
                                    this.employeeWorkdays[name]++;
                                    this.employeeDailyShifts[name].add(nextDay);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Second pass: Fill any remaining shifts that have fewer than 2 employees
        for (const day of this.days) {
            for (const shift of this.shifts) {
                while (this.schedule[day][shift].length < 2) {
                    // Find an employee who hasn't worked 5 days yet and doesn't have a shift on this day
                    const availableEmployees = this.employees.filter(emp => 
                        this.employeeWorkdays[emp.name] < 5 && 
                        !this.employeeDailyShifts[emp.name].has(day)
                    );
                    
                    if (availableEmployees.length === 0) {
                        console.warn(`Warning: Not enough employees to fill ${shift} shift on ${day}`);
                        break;
                    }
                    
                    // Randomly select an employee
                    const randomIndex = Math.floor(Math.random() * availableEmployees.length);
                    const selectedEmployee = availableEmployees[randomIndex].name;
                    
                    this.schedule[day][shift].push(selectedEmployee);
                    this.employeeWorkdays[selectedEmployee]++;
                    this.employeeDailyShifts[selectedEmployee].add(day);
                }
            }
        }
    }
    
    printSchedule() {
        console.log("\n=== WEEKLY SCHEDULE ===");
        for (const day of this.days) {
            console.log(`\n${day}:`);
            for (const shift of this.shifts) {
                const employees = this.schedule[day][shift].join(", ");
                console.log(`  ${shift.charAt(0).toUpperCase() + shift.slice(1)}: ${employees}`);
            }
        }
        
        console.log("\n=== EMPLOYEE WORKDAYS ===");
        for (const employee of this.employees) {
            const name = employee.name;
            console.log(`${name}: ${this.employeeWorkdays[name]} days`);
        }
    }
}

// Example usage
const scheduler = new EmployeeScheduler();

// Add employees with their preferences
scheduler.addEmployee("Neal", {
    "Monday": "morning", "Tuesday": "afternoon", "Wednesday": "morning",
    "Thursday": "afternoon", "Friday": "morning", "Saturday": "evening", "Sunday": "evening"
});

scheduler.addEmployee("Caffrey", {
    "Monday": "afternoon", "Tuesday": "morning", "Wednesday": "afternoon",
    "Thursday": "morning", "Friday": "afternoon", "Saturday": "morning", "Sunday": "morning"
});

scheduler.addEmployee("Moz", {
    "Monday": "evening", "Tuesday": "evening", "Wednesday": "evening",
    "Thursday": "evening", "Friday": "evening", "Saturday": "afternoon", "Sunday": "afternoon"
});

scheduler.addEmployee("Alex", {
    "Monday": "morning", "Tuesday": "morning", "Wednesday": "afternoon",
    "Thursday": "afternoon", "Friday": "evening", "Saturday": "evening", "Sunday": "morning"
});

scheduler.addEmployee("Elizabeth", {
    "Monday": "evening", "Tuesday": "evening", "Wednesday": "morning",
    "Thursday": "morning", "Friday": "afternoon", "Saturday": "afternoon", "Sunday": "evening"
});

// Assign shifts and print schedule
scheduler.assignShifts();
scheduler.printSchedule();
