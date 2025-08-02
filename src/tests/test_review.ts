// test_review.ts - Simple test file to trigger AI code review

/**
 * Simple greeting functions to test the AI code review agent
 */

// Basic hello world function
function sayHello(name?: string): string {
    if (name) {
      return `Hello, ${name}!`;
    }
    return "Hello, World!";
  }
  
  // Alternative implementation with default parameter
  const greetUser = (name: string = "World"): string => {
    return `Hello, ${name}!`;
  };
  
  // Function with some potential issues for AI to catch
  function processName(input) {  // Missing type annotation
    if(!input) return;  // Missing explicit return type
    
    let result = input.toUpperCase();  // Potential error if input is not string
    console.log(result);  // Side effect in function
    return result;
  }
  
  // Main execution
  const userName = "GitHub";
  console.log(sayHello());
  console.log(sayHello(userName));
  console.log(greetUser());
  console.log(greetUser("AI Agent"));
  
  // Test the problematic function
  processName("test user");
  processName(null);  // This might cause issues
  
  export { sayHello, greetUser, processName };
  