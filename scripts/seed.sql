-- AI Boilerplate Database Seed
-- This file contains sample data for development and testing

-- Insert sample users (passwords should be hashed in production)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', NOW(), NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'user@example.com', NOW(), NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'demo@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO users (id, email, name, avatar_url, stripe_customer_id, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', NULL, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'user@example.com', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', NULL, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'demo@example.com', 'Demo Account', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample AI conversations
INSERT INTO ai_conversations (id, user_id, prompt, response, model, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Hello, can you help me with React development?', 'Yes, I can definitely help you with React development! React is a popular JavaScript library for building user interfaces. What specific aspect would you like to work on?', 'gpt-3.5-turbo', NOW() - INTERVAL '2 hours'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Explain the useEffect hook', 'The useEffect hook in React is used to perform side effects in functional components. It runs after every render by default, but you can control when it runs by passing dependencies.

Basic syntax:
useEffect(() => {
  // Your side effect code here
  return () => {
    // Cleanup function (optional)
  };
}, [dependencies]);

Common use cases:
- Fetching data from APIs
- Setting up subscriptions
- Manually updating the DOM
- Setting up timers

The dependency array controls when the effect runs:
- No array: runs after every render
- Empty array: runs only once (on mount)
- With dependencies: runs when those dependencies change', 'gpt-3.5-turbo', NOW() - INTERVAL '1.5 hours'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Write a function to reverse a string in JavaScript', 'Here are a few ways to reverse a string in JavaScript:

1. Using built-in methods:
function reverseString(str) {
  return str.split('').reverse().join('');
}

2. Using a loop:
function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

3. Using reduce:
function reverseString(str) {
  return str.split('').reduce((reversed, char) => char + reversed, '');
}

4. Using recursion:
function reverseString(str) {
  if (str === '') return '';
  return reverseString(str.substr(1)) + str.charAt(0);
}

All of these methods will work, but the first one using split/reverse/join is probably the most readable and commonly used.', 'gpt-3.5-turbo', NOW() - INTERVAL '30 minutes'),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000002', 'What is TypeScript and why should I use it?', 'TypeScript is a programming language developed by Microsoft that builds on JavaScript by adding static type definitions. It is a superset of JavaScript, meaning any valid JavaScript code is also valid TypeScript code.

Key benefits of using TypeScript:

1. **Static Typing**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
3. **Self-Documenting Code**: Types serve as documentation for your code
4. **Easier Refactoring**: Large-scale changes are safer and more reliable
5. **Better Team Collaboration**: Clear contracts between different parts of your codebase

TypeScript is particularly valuable for:
- Large codebases
- Team development
- Complex applications
- Long-term maintenance
- Enterprise applications

While it has a learning curve, the benefits usually outweigh the costs for most modern web development projects.', 'gpt-4', NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert sample bots
INSERT INTO bots (id, user_id, name, description, instructions, model, temperature, max_tokens, is_public, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'Code Assistant', 'A helpful coding assistant that can help with programming tasks', 'You are a helpful coding assistant. You provide clear, concise, and accurate answers about programming concepts, debugging, and best practices. Always include code examples when relevant.', 'gpt-4', 0.7, 2000, true, NOW() - INTERVAL '7 days', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', 'Writing Coach', 'An AI assistant that helps with writing and content creation', 'You are a professional writing coach. Help users improve their writing skills, provide feedback on content, and assist with various writing tasks including creative writing, technical writing, and copywriting.', 'gpt-3.5-turbo', 0.8, 1500, true, NOW() - INTERVAL '5 days', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000002', 'Math Tutor', 'A patient and helpful math tutor for all levels', 'You are a patient and encouraging math tutor. Explain concepts clearly, break down complex problems into simpler steps, and adapt your teaching style to the user\'s level of understanding.', 'gpt-3.5-turbo', 0.3, 1000, false, NOW() - INTERVAL '3 days', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000003', 'Business Advisor', 'Strategic business advice and planning assistance', 'You are an experienced business consultant. Provide strategic advice, help with business planning, offer insights on market trends, and assist with various business-related decisions and challenges.', 'gpt-4', 0.6, 2500, true, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample bot conversations
INSERT INTO bot_conversations (id, bot_id, user_id, messages, created_at, updated_at) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', '[{"id": "msg1", "role": "user", "content": "How do I center a div in CSS?", "timestamp": "' || (NOW() - INTERVAL '1 hour')::text || '"}, {"id": "msg2", "role": "assistant", "content": "There are several ways to center a div in CSS:\n\n1. Using flexbox (modern approach):\n```css\n.parent {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}\n```\n\n2. Using CSS Grid:\n```css\n.parent {\n  display: grid;\n  place-items: center;\n  height: 100vh;\n}\n```\n\n3. Using absolute positioning:\n```css\n.parent {\n  position: relative;\n  height: 100vh;\n}\n\n.child {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n```\n\nThe flexbox approach is generally recommended for modern web development.", "timestamp": "' || (NOW() - INTERVAL '59 minutes')::text || '"}]', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '59 minutes'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000002', '[{"id": "msg3", "role": "user", "content": "Help me write a compelling product description", "timestamp": "' || (NOW() - INTERVAL '30 minutes')::text || '"}, {"id": "msg4", "role": "assistant", "content": "I\'d be happy to help you write a compelling product description! To create the best description, I need to know:\n\n1. What type of product is it?\n2. What are its key features and benefits?\n3. Who is your target audience?\n4. What makes it unique compared to competitors?\n\nOnce you provide these details, I can help craft a persuasive description that highlights the value proposition and motivates potential customers to make a purchase.", "timestamp": "' || (NOW() - INTERVAL '29 minutes')::text || '"}]', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '29 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (id, user_id, stripe_subscription_id, stripe_customer_id, status, plan_id, current_period_start, current_period_end, created_at, updated_at) VALUES
('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000003', 'sub_sample123', 'cus_sample456', 'active', 'pro', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '🎉 Database seeding completed successfully!';
    RAISE NOTICE '📊 Sample data includes:';
    RAISE NOTICE '   • 3 users (admin, user, demo)';
    RAISE NOTICE '   • 4 AI conversations';
    RAISE NOTICE '   • 4 custom bots';
    RAISE NOTICE '   • 2 bot conversations';
    RAISE NOTICE '   • 1 active subscription';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next steps:';
    RAISE NOTICE '   1. Update your .env.local with actual service credentials';
    RAISE NOTICE '   2. Run the development server: npm run dev';
    RAISE NOTICE '   3. Visit http://localhost:3000 to see the application';
END $$;