// Test template validation logic

const text1 = "Your order {{1}} has been confirmed. Total: ${{2}}";
const text2 = "{{1}} {{2}}"; // Only parameters
const text3 = "  {{1}}  "; // Only parameters with spaces

function validateTemplate(text) {
  console.log('\n---');
  console.log('Original text:', JSON.stringify(text));
  console.log('Length:', text.length);
  
  const textWithoutParams = text.replace(/\{\{\d+\}\}/g, '').trim();
  console.log('After removing params:', JSON.stringify(textWithoutParams));
  console.log('Length after:', textWithoutParams.length);
  
  if (!textWithoutParams) {
    console.log('❌ INVALID: No actual text');
  } else {
    console.log('✅ VALID: Has actual text');
  }
}

console.log('Testing template validation:\n');

validateTemplate(text1);
validateTemplate(text2);
validateTemplate(text3);

// Test with potential hidden characters
const text4 = "Your order {{1}} has been confirmed. Total: ${{2}}";
validateTemplate(text4);

// Test what you might have typed
console.log('\n\n🔍 Checking for hidden characters:');
for (let i = 0; i < text1.length; i++) {
  const char = text1[i];
  const code = text1.charCodeAt(i);
  if (code < 32 || code > 126) {
    console.log(`Position ${i}: "${char}" (code: ${code}) - SPECIAL CHARACTER!`);
  }
}
