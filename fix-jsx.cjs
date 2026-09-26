const fs = require('fs');
let c = fs.readFileSync('src/pages/SalaryPage.tsx', 'utf8');

const endOfFile = `              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple dummy icon to avoid another import issue if Users is missing
const Users = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);`;

const correctEnd = `              })()}
            </div>
          )}
        </div>
      </div>
  );
}

// Simple dummy icon to avoid another import issue if Users is missing
const Users = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);`;

// Let's just manually rewrite the end of the file properly by replacing everything after `              })()}`
const idx = c.indexOf('              })()}');
if (idx > -1) {
  c = c.substring(0, idx) + correctEnd;
  fs.writeFileSync('src/pages/SalaryPage.tsx', c);
  console.log('Fixed end of file');
} else {
  console.log('Not found');
}
