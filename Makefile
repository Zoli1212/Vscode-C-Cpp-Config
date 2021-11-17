clean:
	rm -rf test/testAssets/C/.vscode
	rm -f test/testAssets/C/.clang-format
	rm -f test/testAssets/C/.clang-tidy
	rm -f test/testAssets/C/.editorconfig
	rm -f test/testAssets/C/.gitattributes
	rm -f test/testAssets/C/.gitignore
	rm -f test/testAssets/C/*.exe
	rm -rf test/testAssets/Cpp/.vscode
	rm -f test/testAssets/Cpp/.clang-format
	rm -f test/testAssets/Cpp/.clang-tidy
	rm -f test/testAssets/Cpp/.editorconfig
	rm -f test/testAssets/Cpp/.gitattributes
	rm -f test/testAssets/Cpp/.gitignore
	rm -f test/testAssets/Cpp/*.exe
	rm -rf test/testAssets/CMinimal/.vscode
	rm -f test/testAssets/CMinimal/.clang-format
	rm -f test/testAssets/CMinimal/.clang-tidy
	rm -f test/testAssets/CMinimal/.editorconfig
	rm -f test/testAssets/CMinimal/.gitattributes
	rm -f test/testAssets/CMinimal/.gitignore
	rm -f test/testAssets/CMinimal/*.exe
	rm -rf test/testAssets/CppMinimal/.vscode
	rm -f test/testAssets/CppMinimal/.clang-format
	rm -f test/testAssets/CppMinimal/.clang-tidy
	rm -f test/testAssets/CppMinimal/.editorconfig
	rm -f test/testAssets/CppMinimal/.gitattributes
	rm -f test/testAssets/CppMinimal/.gitignore
	rm -f test/testAssets/CppMinimal/*.exe

.phony: clean
